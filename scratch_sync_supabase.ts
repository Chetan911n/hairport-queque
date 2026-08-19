import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eggtejmtahbcbhokgyll.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ3Rlam10YWhiY2Job2tneWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzODg0NzMsImV4cCI6MjA5OTk2NDQ3M30.7EEwWnfKqQ8wvr3Fe4kKh-4dFFg-wqT3xdHKSnS6TVI';

const supabase = createClient(supabaseUrl, supabaseKey);

const initialTickets = [
  { customer_name: "Rahul Sharma", service_type: "Classic Haircut & Fade, Hair Wash", status: "completed" },
  { customer_name: "Vikram Malhotra", service_type: "Nano Plastia Treatment, Hair Wash", status: "completed" },
  { customer_name: "Ananya Roy", service_type: "Global Colour, Hair Spa", status: "completed" },
  { customer_name: "KIRAN", service_type: "Hair Colour", status: "completed" },
  { customer_name: "Rohan Verma", service_type: "Beard Colour, Clean Shave", status: "completed" },
  { customer_name: "Devendra Joshi", service_type: "Smoothing Treatment, De-Tan", status: "completed" },
  { customer_name: "Priya Patel", service_type: "Blue Tox Treatment, Deep Cleansing", status: "serving" },
  { customer_name: "Amit Deshmukh", service_type: "Skin De-Tan, Face Steam", status: "waiting" },
  { customer_name: "Sneha Kulkarni", service_type: "Hair Styling, Hair Wash", status: "waiting" }
];

async function syncData() {
  console.log("Syncing 9 authentic client records to Supabase queue table...");
  const { data, error } = await supabase.from('queue').insert(initialTickets).select();
  if (error) {
    console.error("❌ Error inserting into queue:", error);
  } else {
    console.log("✅ SUCCESS! Inserted", data.length, "authentic client records directly into Supabase queue table!");
    console.log(JSON.stringify(data, null, 2));
  }
  process.exit(0);
}

syncData();
