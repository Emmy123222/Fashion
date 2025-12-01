const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://djfrkmlhhgcjxtfdrbat.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZnJrbWxoaGdjanh0ZmRyYmF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTY0NTQsImV4cCI6MjA4MDA5MjQ1NH0.8MyCx8c0qhrZ4-_FsiELwOgBsSiGx0GSFsdcSWiOOPA'
);

async function testLogin() {
  console.log('Testing Supabase authentication...\n');
  
  const email = 'test@example.com';
  const password = 'Test123456!';
  
  console.log('Attempting login with:');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      console.log('❌ LOGIN FAILED');
      console.log('Error:', error.message);
      console.log('Error code:', error.status);
      console.log('\nThis means the email/password combination is wrong in Supabase.');
      console.log('Try creating a new user or resetting the password.');
    } else {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('User email:', data.user.email);
      console.log('User ID:', data.user.id);
      console.log('\nYour Supabase connection is working!');
      console.log('The issue must be in your frontend code.');
    }
  } catch (err) {
    console.log('❌ EXCEPTION:', err.message);
  }
}

testLogin();
