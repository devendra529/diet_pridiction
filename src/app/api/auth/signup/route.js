import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.txt');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  const content = fs.readFileSync(USERS_FILE, 'utf-8');
  if (!content.trim()) return [];
  
  return content.split('\n').filter(line => line.trim()).map(line => {
    const [email, password, name, hasDietData] = line.split('|');
    return { email, password, name, hasDietData: hasDietData === 'true' };
  });
}

function writeUsers(users) {
  const content = users.map(u => 
    `${u.email}|${u.password}|${u.name}|${u.hasDietData || false}`
  ).join('\n');
  fs.writeFileSync(USERS_FILE, content, 'utf-8');
}

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const users = readUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create new user
    const hashedPassword = hashPassword(password);
    const newUser = {
      email,
      password: hashedPassword,
      name,
      hasDietData: false
    };

    users.push(newUser);
    writeUsers(users);

    // Return user without password
    return NextResponse.json({
      success: true,
      user: {
        email: newUser.email,
        name: newUser.name,
        hasDietData: false
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}