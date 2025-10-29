import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DIET_DIR = path.join(DATA_DIR, 'diet');
const USERS_FILE = path.join(DATA_DIR, 'users.txt');

// ---------- GET: Fetch User Diet ----------
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const userDietFile = path.join(DIET_DIR, `${email.replace('@', '_at_')}.txt`);

    if (!fs.existsSync(userDietFile)) {
      return NextResponse.json({ error: 'Diet data not found' }, { status: 404 });
    }

    const content = fs.readFileSync(userDietFile, 'utf-8');
    const dietData = parseDietFile(content);

    return NextResponse.json({ success: true, dietData });
  } catch (error) {
    console.error('Get diet error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------- Parse Diet File ----------
function parseDietFile(content) {
  const lines = content.split('\n');
  const data = {};

  lines.forEach(line => {
    if (line.includes('Age:')) data.age = line.split(':')[1].trim().split(' ')[0];
    if (line.includes('Gender:')) data.gender = line.split(':')[1].trim();
    if (line.includes('Weight:')) data.weight = line.split(':')[1].trim().split(' ')[0];
    if (line.includes('Height:')) data.height = line.split(':')[1].trim().split(' ')[0];
    if (line.includes('Activity Level:')) data.activityLevel = line.split(':')[1].trim();
    if (line.includes('Primary Goal:')) data.goal = line.split(':')[1].trim();
    if (line.includes('Restrictions:')) data.dietaryRestrictions = line.split(':')[1].trim();
    if (line.includes('Conditions:')) data.medicalConditions = line.split(':')[1].trim();
  });

  return data;
}

// ---------- Read Users ----------
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const content = fs.readFileSync(USERS_FILE, 'utf-8');
  if (!content.trim()) return [];

  return content
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const [email, password, name, hasDietData] = line.split('|');
      return { email, password, name, hasDietData: hasDietData === 'true' };
    });
}

// ---------- Write Users ----------
function writeUsers(users) {
  const content = users
    .map(u => `${u.email}|${u.password}|${u.name}|${u.hasDietData || false}`)
    .join('\n');
  fs.writeFileSync(USERS_FILE, content, 'utf-8');
}

// ---------- Simple Password Hash ----------
function hashPassword(password) {
  // For demo — use crypto or bcrypt in production!
  return Buffer.from(password).toString('base64');
}

// ---------- POST: Register User ----------
export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const users = readUsers();

    if (users.find(u => u.email === email)) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);
    const newUser = { email, password: hashedPassword, name, hasDietData: false };

    users.push(newUser);
    writeUsers(users);

    return NextResponse.json({
      success: true,
      user: { email: newUser.email, name: newUser.name, hasDietData: false }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
