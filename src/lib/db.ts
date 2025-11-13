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
        status VARCHAR(50) NOT NULL DEFAULT 'active'
      );
    `;
    console.log(`Created "users" table`);
 
    const initialUsers: Omit<User, 'id'>[] = [
        { name: 'Ahmed Ali', email: 'ahmed.ali@example.com', balance: 4.00, status: 'active' },
        { name: 'Fatima Zahra', email: 'fatima.zahra@example.com', balance: 50.00, status: 'active' },
        { name: 'Youssef Hassan', email: 'youssef.hassan@example.com', balance: 120.00, status: 'suspended' },
    ];
    
    // Insert data into the "users" table
    await Promise.all(
        initialUsers.map(async (user) => {
            return sql`
                INSERT INTO users (name, email, balance, status)
                VALUES (${user.name}, ${user.email}, ${user.balance}, ${user.status})
                ON CONFLICT (email) DO NOTHING;
            `;
        })
    );
     console.log(`Seeded ${initialUsers.length} users`);

    // Create the campaigns table if it doesn't exist
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

    const initialCampaigns = [
        { user_name: 'Ahmed Ali', headline: 'مستقبل الإعلان بالذكاء الاصطناعي هنا', status: 'active' },
        { user_name: 'Fatima Zahra', headline: 'خصم 50% على منتجات الصيف', status: 'active' },
    ];

    // Get user IDs to link campaigns
    const ahmed = await sql`SELECT id from USERS where email='ahmed.ali@example.com'`;
    const fatima = await sql`SELECT id from USERS where email='fatima.zahra@example.com'`;

    // Insert data into the "campaigns" table
    await Promise.all([
        sql`
            INSERT INTO campaigns (user_id, user_name, headline, status)
            VALUES (${ahmed.rows[0].id}, ${initialCampaigns[0].user_name}, ${initialCampaigns[0].headline}, ${initialCampaigns[0].status})
            ON CONFLICT (id) DO NOTHING;
        `,
        sql`
            INSERT INTO campaigns (user_id, user_name, headline, status)
            VALUES (${fatima.rows[0].id}, ${initialCampaigns[1].user_name}, ${initialCampaigns[1].headline}, ${initialCampaigns[1].status})
            ON CONFLICT (id) DO NOTHING;
        `,
    ]);
     console.log(`Seeded ${initialCampaigns.length} campaigns`);


  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}