// ============================================
// FILE: src/app/api/auth/login/route.js
// ============================================
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.txt');

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

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const users = readUsers();
    const hashedPassword = hashPassword(password);
    
    const user = users.find(u => u.email === email && u.password === hashedPassword);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        hasDietData: user.hasDietData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}