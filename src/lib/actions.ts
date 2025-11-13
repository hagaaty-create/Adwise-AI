'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { seed } from './db';

// This function is now safe to be called from client components as well.
export async function getBalance() {
  try {
    const { rows } = await sql`SELECT balance FROM users WHERE email = 'ahmed.ali@example.com'`;
    if (rows.length > 0) {
      return parseFloat(rows[0].balance);
    }
    await seed();
    const { rows: newRows } = await sql`SELECT balance FROM users WHERE email = 'ahmed.ali@example.com'`;
     if (newRows.length > 0) {
      return parseFloat(newRows[0].balance);
    }

  } catch (error) {
    console.error('Failed to fetch balance:', error);
  }
  // Return a default balance if DB fails, to prevent app crash.
  return 4.00;
}


// Function to get all users
export async function getUsers() {
  try {
    const { rows } = await sql`SELECT * FROM users`;
    return rows;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    // In case of error (e.g., table not found), seed the database and try again.
    await seed();
    const { rows } = await sql`SELECT * FROM users`;
    return rows;
  }
}

// Function to get all campaigns
export async function getCampaigns() {
  try {
    const { rows } = await sql`SELECT * FROM campaigns`;
    return rows;
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    // In case of error (e.g., table not found), seed the database and try again.
    await seed();
    const { rows } = await sql`SELECT * FROM campaigns`;
    return rows;
  }
}

// Function to toggle user status
export async function toggleUserStatus(userId: string, currentStatus: 'active' | 'suspended') {
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

// Function to add balance to a user
export async function addUserBalance(userId: string, amount: number) {
  const parsedAmount = z.number().positive().parse(amount);
  try {
    await sql`
      UPDATE users
      SET balance = balance + ${parsedAmount}
      WHERE id = ${userId}
    `;
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard/financials'); // Also revalidate financials page
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to add user balance.');
  }
}

// Function to toggle campaign status
export async function toggleCampaignStatus(campaignId: string, currentStatus: 'active' | 'paused') {
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
