// Quick test to check if Supabase storage bucket exists
// Run with: node test-supabase-storage.js

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  console.log("🔍 Testing Supabase Storage...\n");
  console.log("Supabase URL:", supabaseUrl);
  console.log("");

  try {
    // List all buckets
    console.log("📦 Checking for buckets...");
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error("❌ Error listing buckets:", bucketsError.message);
      return;
    }

    console.log(`Found ${buckets.length} bucket(s):\n`);
    buckets.forEach((bucket) => {
      console.log(
        `  - ${bucket.name} (${bucket.public ? "PUBLIC" : "PRIVATE"})`
      );
    });
    console.log("");

    // Check for profile-pictures bucket
    const profileBucket = buckets.find((b) => b.name === "profile-pictures");

    if (profileBucket) {
      console.log('✅ SUCCESS: "profile-pictures" bucket exists!');
      console.log(
        `   Status: ${profileBucket.public ? "PUBLIC ✓" : "PRIVATE ⚠️"}`
      );

      if (!profileBucket.public) {
        console.log(
          "\n⚠️  WARNING: Bucket should be PUBLIC for profile pictures to work"
        );
        console.log(
          "   Go to Supabase Dashboard > Storage > profile-pictures > Settings"
        );
        console.log('   Enable "Public bucket"');
      } else {
        console.log("\n🎉 Everything is configured correctly!");
        console.log("   You can now upload profile pictures in the app.");
      }
    } else {
      console.log('❌ MISSING: "profile-pictures" bucket not found!');
      console.log("\n📝 TO FIX:");
      console.log("   1. Go to https://supabase.com/dashboard");
      console.log("   2. Select your project");
      console.log('   3. Click "Storage" in sidebar');
      console.log('   4. Click "New bucket"');
      console.log("   5. Name: profile-pictures");
      console.log('   6. Check "Public bucket" ✓');
      console.log('   7. Click "Create bucket"');
      console.log(
        "\n   See CREATE_STORAGE_BUCKET.md for detailed instructions"
      );
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testStorage();
