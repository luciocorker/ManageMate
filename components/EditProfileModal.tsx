import { IconSymbol } from "@/components/ui/icon-symbol";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface UserProfile {
  full_name: string;
  phone_number: string;
  location: string;
  linkedin_url: string;
  github_url: string;
  bio: string;
  profile_picture_url: string;
}

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function EditProfileModal({
  visible,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    phone_number: "",
    location: "",
    linkedin_url: "",
    github_url: "",
    bio: "",
    profile_picture_url: "",
  });

  useEffect(() => {
    if (visible) {
      loadProfile();
    }
  }, [visible]);

  const loadProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("firebase_uid", user.uid)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone_number: data.phone_number || "",
          location: data.location || "",
          linkedin_url: data.linkedin_url || "",
          github_url: data.github_url || "",
          bio: data.bio || "",
          profile_picture_url: data.profile_picture_url || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload a profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadImage = async (uri: string) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "No user logged in");
      return;
    }

    setUploading(true);

    try {
      console.log("=== Starting Image Upload ===");
      console.log("URI:", uri);
      console.log("User ID:", user.uid);

      // Read the file as base64 using legacy FileSystem
      console.log("Reading file as base64...");
      let base64: string;

      try {
        base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
        });
        console.log("✓ File read successfully, length:", base64.length);
      } catch (readError: any) {
        console.error("✗ Error reading file:", readError);
        throw new Error(`Failed to read image file: ${readError.message}`);
      }

      // Validate base64
      if (!base64 || base64.length === 0) {
        throw new Error("Image file is empty");
      }

      // Create file name
      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const timestamp = Date.now();
      const fileName = `${user.uid}/${timestamp}.${fileExt}`;
      const contentType = `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;

      console.log("File name:", fileName);
      console.log("Content type:", contentType);

      // Convert base64 to ArrayBuffer
      console.log("Converting to ArrayBuffer...");
      let arrayBuffer: ArrayBuffer;

      try {
        arrayBuffer = decode(base64);
        console.log(
          "✓ Converted to ArrayBuffer, size:",
          arrayBuffer.byteLength
        );
      } catch (decodeError: any) {
        console.error("✗ Error decoding base64:", decodeError);
        throw new Error(`Failed to process image: ${decodeError.message}`);
      }

      // Upload to Supabase Storage
      console.log("Uploading to Supabase Storage...");
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, arrayBuffer, {
          contentType: contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error("✗ Supabase upload error:", uploadError);

        // Check for specific errors
        if (
          uploadError.message?.includes("Bucket not found") ||
          uploadError.message?.includes("bucket")
        ) {
          throw new Error(
            "SETUP REQUIRED:\n\n" +
              "1. Go to Supabase Dashboard\n" +
              "2. Click Storage\n" +
              "3. Create new bucket: 'profile-pictures'\n" +
              "4. Make it PUBLIC\n" +
              "5. Try uploading again\n\n" +
              "See CREATE_STORAGE_BUCKET.md for details"
          );
        }

        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log("✓ Upload successful:", uploadData);

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-pictures").getPublicUrl(fileName);

      console.log("✓ Public URL generated:", publicUrl);

      // Update profile state with new image URL
      setProfile({ ...profile, profile_picture_url: publicUrl });

      console.log("=== Upload Complete ===");
      Alert.alert("Success!", "Profile picture uploaded successfully");
    } catch (error: any) {
      console.error("=== Upload Failed ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);

      // Show user-friendly error message
      Alert.alert(
        "Upload Failed",
        error.message || "Failed to upload profile picture. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          location: profile.location,
          linkedin_url: profile.linkedin_url,
          github_url: profile.github_url,
          bio: profile.bio,
          profile_picture_url: profile.profile_picture_url,
        })
        .eq("firebase_uid", user.uid);

      if (error) throw error;

      Alert.alert("Success", "Profile updated successfully!");
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="xmark" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Picture */}
          <View style={styles.imageSection}>
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={pickImage}
              disabled={uploading}
            >
              {profile.profile_picture_url ? (
                <Image
                  source={{ uri: profile.profile_picture_url }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <IconSymbol name="person.fill" size={50} color="#9ca3af" />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <IconSymbol name="camera.fill" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.imageHint}>
              {uploading ? "Uploading..." : "Tap to change profile picture"}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <IconSymbol name="person.fill" size={20} color="#ff6b6b" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={profile.full_name}
                  onChangeText={(text) =>
                    setProfile({ ...profile, full_name: text })
                  }
                  placeholderTextColor="#a0aec0"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <IconSymbol name="phone.fill" size={20} color="#ff6b6b" />
                <TextInput
                  style={styles.input}
                  placeholder="+1 (555) 123-4567"
                  value={profile.phone_number}
                  onChangeText={(text) =>
                    setProfile({ ...profile, phone_number: text })
                  }
                  keyboardType="phone-pad"
                  placeholderTextColor="#a0aec0"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.inputContainer}>
                <IconSymbol name="location.fill" size={20} color="#ff6b6b" />
                <TextInput
                  style={styles.input}
                  placeholder="City, Country"
                  value={profile.location}
                  onChangeText={(text) =>
                    setProfile({ ...profile, location: text })
                  }
                  placeholderTextColor="#a0aec0"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell us about yourself..."
                  value={profile.bio}
                  onChangeText={(text) => setProfile({ ...profile, bio: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#a0aec0"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Social Links</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>LinkedIn</Text>
              <View style={styles.inputContainer}>
                <IconSymbol name="link.circle.fill" size={20} color="#0077b5" />
                <TextInput
                  style={styles.input}
                  placeholder="https://linkedin.com/in/username"
                  value={profile.linkedin_url}
                  onChangeText={(text) =>
                    setProfile({ ...profile, linkedin_url: text })
                  }
                  keyboardType="url"
                  autoCapitalize="none"
                  placeholderTextColor="#a0aec0"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>GitHub</Text>
              <View style={styles.inputContainer}>
                <IconSymbol
                  name="chevron.left.forwardslash.chevron.right"
                  size={20}
                  color="#333"
                />
                <TextInput
                  style={styles.input}
                  placeholder="https://github.com/username"
                  value={profile.github_url}
                  onChangeText={(text) =>
                    setProfile({ ...profile, github_url: text })
                  }
                  keyboardType="url"
                  autoCapitalize="none"
                  placeholderTextColor="#a0aec0"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ff6b6b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  imageHint: {
    fontSize: 14,
    color: "#6b7280",
  },
  form: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 24,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
    gap: 12,
  },
  textAreaContainer: {
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2d3748",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 40,
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
