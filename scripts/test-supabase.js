const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lfwguyfgyyemdkpdobij.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmd2d1eWZneXllbWRrcGRvYmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzg3OTQsImV4cCI6MjEwMTYxNDc5NH0.WFOAwMvWj00OYaqJFOrixXapXQ-KRkW00dTs_peuHRs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection for project:', supabaseUrl);
  try {
    const { data, error } = await supabase.from('routes').select('*');
    if (error) {
      console.log('Query result:', error.message);
    } else {
      console.log('SUCCESS! Database routes table query result count:', data.length);
    }
  } catch (err) {
    console.error('Error connecting:', err);
  }
}

testConnection();
