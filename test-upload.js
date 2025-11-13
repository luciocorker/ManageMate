// Test if we can upload to Supabase Storage
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  console.log("🧪 Testing upload to profile-pictures bucket...\n");

  try {
    // Create a simple test file
    const testData = Buffer.from("test image data");
    const fileName = `test/${Date.now()}.txt`;

    console.log("📤 Attempting upload...");
    console.log("File:", fileName);

    const { data, error } = await supabase.storage
      .from("profile-pictures")
      .upload(fileName, testData, {
        contentType: "text/plain",
        upsert: true,
      });

    if (error) {
      console.error("❌ Upload failed:", error.message);
      console.error("Error details:", error);

      if (error.message.includes("Bucket not found")) {
        console.log(
          "\n💡 The bucket exists in dashboard but API cannot access it."
        );
        console.log("   This usually means:");
        console.log("   1. Bucket is not public");
        console.log("   2. Storage policies are missing");
        console.log(
          "   3. Need to wait a few seconds for changes to propagate"
        );
      }
      return;
    }

    console.log("✅ Upload successful!");
    console.log("Data:", data);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-pictures").getPublicUrl(fileName);

    console.log("🔗 Public URL:", publicUrl);
    console.log(
      "\n🎉 Everything works! You can now upload profile pictures in the app."
    );

    // Clean up test file
    console.log("\n🧹 Cleaning up test file...");
    await supabase.storage.from("profile-pictures").remove([fileName]);
    console.log("✓ Test file removed");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testUpload();
