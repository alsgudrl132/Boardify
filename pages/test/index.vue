<template></template>

<script>
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default {
  async mounted() {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Error fetching data:", error);
      } else {
        console.log("Data fetched successfully:", data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  },
};
</script>
