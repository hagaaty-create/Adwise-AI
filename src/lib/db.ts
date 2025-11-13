import { sql } from '@vercel/postgres';
 
export type User = {
    id: string;
    name: string;
    email: string;
    balance: number;
    status: 'active' | 'suspended';
};

export type Campaign = {
    id: string;
    user_id: string;
    user_name: string;
    headline: string;
    status: 'active' | 'paused';
};

export type Article = {
    id: string;
    title: string;
    content: string;
    html_content: string;
    keywords: string;
    created_at: Date;
};

export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  created_at: string;
};

export type Withdrawal = {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  phone_number: string;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
};


export async function seed() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    // Create the users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        referral_earnings NUMERIC(10, 2) NOT NULL DEFAULT 0.00
      );
    `;
    console.log(`Created "users" table`);
 
    // Insert initial admin user
    await sql`
        INSERT INTO users (id, name, email, balance, status, referral_earnings)
        VALUES ('1c82831c-4b68-4e1a-9494-27a3c3b4a5f7', 'Hagaaty Admin', 'hagaaty@gmail.com', 4.00, 'active', 25.00)
        ON CONFLICT (email) DO UPDATE SET 
            name = EXCLUDED.name,
            status = EXCLUDED.status,
            referral_earnings = 25.00;
    `;
    console.log(`Seeded admin user`);

    // Create the transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(10, 2) NOT NULL,
        description VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log(`Created "transactions" table`);
    
    // Insert welcome bonus transaction for admin user
    await sql`
        INSERT INTO transactions (user_id, amount, description)
        SELECT '1c82831c-4b68-4e1a-9494-27a3c3b4a5f7', 4.00, 'Welcome Bonus'
        WHERE NOT EXISTS (
            SELECT 1 FROM transactions WHERE user_id = '1c82831c-4b68-4e1a-9494-27a3c3b4a5f7' AND description = 'Welcome Bonus'
        );
    `;
    console.log('Seeded welcome bonus transaction');

    // Create the campaigns table
    await sql`
        CREATE TABLE IF NOT EXISTS campaigns (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES users(id),
            user_name VARCHAR(255) NOT NULL,
            headline VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'active'
        );
    `;
    console.log(`Created "campaigns" table`);

    // Create the articles table
    await sql`
      CREATE TABLE IF NOT EXISTS articles (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        html_content TEXT NOT NULL,
        keywords VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log(`Created "articles" table`);

    // Create the withdrawals table
    await sql`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        user_name VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        phone_number VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log(`Created "withdrawals" table`);

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
