'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { seed, type Transaction } from './db';

const USER_ID = '1c82831c-4b68-4e1a-9494-27a3c3b4a5f7'; // Hardcoded ID for 'ahmed.ali@example.com'

async function ensureDbSeeded() {
    try {
        // A light query to check if the table exists. If not, seed.
        await sql`SELECT 1 FROM users LIMIT 1;`;
    } catch (error: any) {
        if (error.message.includes('relation "users" does not exist')) {
            console.log("Tables not found, seeding database...");
            await seed();
        } else {
            throw error; // Re-throw other errors
        }
    }
}

export async function getBalance() {
  await ensureDbSeeded();
  try {
    const { rows } = await sql`SELECT balance FROM users WHERE id = ${USER_ID}`;
    if (rows.length > 0) {
      return parseFloat(rows[0].balance);
    }
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    // In a real app, you might want to throw an error here.
    // For this demo, we return a default to prevent crashing.
  }
  return 0.00;
}

export async function getTransactions(): Promise<Transaction[]> {
    await ensureDbSeeded();
    try {
        const { rows } = await sql`SELECT * FROM transactions WHERE user_id = ${USER_ID} ORDER BY created_at DESC`;
        return rows as Transaction[];
    } catch (error) {
        console.error('Failed to fetch transactions:', error);
        return [];
    }
}

export async function addTransaction(userId: string, amount: number, description: string) {
    await ensureDbSeeded();
    const validatedAmount = z.number().parse(amount);
    const validatedUserId = z.string().uuid().parse(userId);
    const validatedDescription = z.string().min(1).parse(description);

    try {
        // Use a transaction to ensure atomicity
        await sql`BEGIN`;
        await sql`
            UPDATE users
            SET balance = balance + ${validatedAmount}
            WHERE id = ${validatedUserId}
        `;
        await sql`
            INSERT INTO transactions (user_id, amount, description)
            VALUES (${validatedUserId}, ${validatedAmount}, ${validatedDescription})
        `;
        await sql`COMMIT`;
        
        revalidatePath('/dashboard/financials');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        await sql`ROLLBACK`;
        console.error('Database Error: Failed to add transaction.', error);
        throw new Error('Failed to add transaction.');
    }
}


// Function to get all users (for admin)
export async function getUsers() {
  await ensureDbSeeded();
  try {
    const { rows } = await sql`SELECT * FROM users`;
    return rows;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

// Function to get all campaigns (for admin)
export async function getCampaigns() {
  await ensureDbSeeded();
  try {
    const { rows } = await sql`SELECT * FROM campaigns`;
    return rows;
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return [];
  }
}

// Function to toggle user status (for admin)
export async function toggleUserStatus(userId: string, currentStatus: 'active' | 'suspended') {
  await ensureDbSeeded();
  const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
  try {
    await sql`
      UPDATE users
      SET status = ${newStatus}
      WHERE id = ${userId}
    `;
    revalidatePath('/dashboard/admin');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to toggle user status.');
  }
}

// This function is now used by both admin and client-side actions.
export async function addUserBalance(userId: string, amount: number) {
  await ensureDbSeeded();
  const parsedAmount = z.number().parse(amount);
  try {
    await sql`
      UPDATE users
      SET balance = balance + ${parsedAmount}
      WHERE id = ${userId}
    `;
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard/financials');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to add user balance.');
  }
}


// Function to toggle campaign status (for admin)
export async function toggleCampaignStatus(campaignId: string, currentStatus: 'active' | 'paused') {
  await ensureDbSeeded();
  const newStatus = currentStatus === 'active' ? 'paused' : 'active';
  try {
    await sql`
      UPDATE campaigns
      SET status = ${newStatus}
      WHERE id = ${campaignId}
    `;
    revalidatePath('/dashboard/admin');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to toggle campaign status.');
  }
}

const ArticleSchema = z.object({
  title: z.string(),
  content: z.string(),
  html_content: z.string(),
  keywords: z.string(),
});

export async function saveArticle(articleData: z.infer<typeof ArticleSchema>) {
    await ensureDbSeeded();
    try {
        const validatedData = ArticleSchema.parse(articleData);
        await sql`
            INSERT INTO articles (title, content, html_content, keywords)
            VALUES (${validatedData.title}, ${validatedData.content}, ${validatedData.html_content}, ${validatedData.keywords})
        `;
        revalidatePath('/dashboard/admin/site-marketing');
        console.log('Article saved to database successfully.');
    } catch (error) {
        console.error('Database Error: Failed to save article', error);
        throw new Error('Failed to save article to database.');
    }
}
