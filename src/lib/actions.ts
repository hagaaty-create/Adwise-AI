'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { seed, type Transaction, type Withdrawal, type User, type Campaign, type Article } from './db';
import { Resend } from 'resend';

// This should be in environment variables, but for demo purposes it's here.
const resend = new Resend('re_123456789'); // Replace with a real key only in production env vars.

const USER_ID = '1c82831c-4b68-4e1a-9494-27a3c3b4a5f7'; // Hardcoded ID for 'hagaaty@gmail.com'

async function ensureDbSeeded() {
    try {
        await sql`SELECT 1 FROM users LIMIT 1;`;
    } catch (error: any) {
        if (error.message.includes('relation "users" does not exist') || error.message.includes('relation "withdrawals" does not exist') || error.message.includes('relation "campaigns" does not exist') || error.message.includes('relation "articles" does not exist')) {
            console.log("Tables not found, seeding database...");
            await seed();
        } else {
            throw error;
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
  }
  return 0.00;
}

export async function getFinancials() {
    await ensureDbSeeded();
    try {
        const userQuery = sql`SELECT balance, referral_earnings FROM users WHERE id = ${USER_ID}`;
        const transactionsQuery = sql`SELECT * FROM transactions WHERE user_id = ${USER_ID} ORDER BY created_at DESC`;
        const withdrawalsQuery = sql`SELECT * FROM withdrawals WHERE user_id = ${USER_ID} ORDER BY created_at DESC`;

        const [userResult, transactionsResult, withdrawalsResult] = await Promise.all([
            userQuery,
            transactionsQuery,
            withdrawalsQuery
        ]);

        return {
            balance: userResult.rows.length > 0 ? parseFloat(userResult.rows[0].balance) : 0,
            referralEarnings: userResult.rows.length > 0 ? parseFloat(userResult.rows[0].referral_earnings) : 0,
            transactions: transactionsResult.rows as Transaction[],
            withdrawals: withdrawalsResult.rows as Withdrawal[],
        };
    } catch (error) {
        console.error('Failed to fetch financial data:', error);
        throw new Error('Failed to connect to the database.');
    }
}


export async function addTransaction(userId: string, amount: number, description: string) {
    await ensureDbSeeded();
    const validatedAmount = z.number().parse(amount);
    const validatedUserId = z.string().uuid().parse(userId);
    const validatedDescription = z.string().min(1).parse(description);

    try {
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

export async function requestWithdrawal(amount: number, phoneNumber: string) {
    await ensureDbSeeded();
    const parsedAmount = z.number().min(1, 'Amount must be greater than 0.').parse(amount);
    const parsedPhoneNumber = z.string().min(10, 'Please enter a valid phone number.').parse(phoneNumber);

    const { rows: userRows } = await sql`SELECT referral_earnings, name, email FROM users WHERE id = ${USER_ID}`;
    if (userRows.length === 0) {
        throw new Error('User not found.');
    }
    const user = userRows[0];
    const availableEarnings = parseFloat(user.referral_earnings);

    if (parsedAmount > availableEarnings) {
        throw new Error('Withdrawal amount cannot exceed your available referral earnings.');
    }

    try {
        await sql`BEGIN`;
        await sql`
            UPDATE users
            SET referral_earnings = referral_earnings - ${parsedAmount}
            WHERE id = ${USER_ID}
        `;
        await sql`
            INSERT INTO withdrawals (user_id, user_name, amount, phone_number, status)
            VALUES (${USER_ID}, ${user.name}, ${parsedAmount}, ${parsedPhoneNumber}, 'pending')
        `;
        await sql`COMMIT`;

        // Send email notification to admin
        try {
            await resend.emails.send({
                from: 'Hagaaty <onboarding@resend.dev>', // Should be a configured domain
                to: 'hagaaty@gmail.com',
                subject: 'New Withdrawal Request',
                html: `
                    <h1>New Withdrawal Request</h1>
                    <p><strong>User:</strong> ${user.name} (${user.email})</p>
                    <p><strong>Amount:</strong> ${parsedAmount.toFixed(2)}</p>
                    <p><strong>Vodafone Cash Number:</strong> ${parsedPhoneNumber}</p>
                    <p>Please process this request and mark it as completed in the admin panel.</p>
                `,
            });
        } catch (emailError) {
            console.error("Email sending failed, but withdrawal was recorded:", emailError);
            // Don't block the user, but log the error
        }

        revalidatePath('/dashboard/financials');
        revalidatePath('/dashboard/admin');
    } catch (dbError) {
        await sql`ROLLBACK`;
        console.error('Database Error: Failed to request withdrawal.', dbError);
        throw new Error('Failed to request withdrawal.');
    }
}

export async function processWithdrawal(withdrawalId: string) {
    await ensureDbSeeded();
    const parsedId = z.string().uuid().parse(withdrawalId);
    try {
        const result = await sql`
            UPDATE withdrawals
            SET status = 'completed', updated_at = CURRENT_TIMESTAMP
            WHERE id = ${parsedId} AND status = 'pending'
        `;
        if (result.rowCount === 0) {
            throw new Error("Withdrawal not found or already processed.");
        }
        revalidatePath('/dashboard/admin');
        revalidatePath('/dashboard/financials');
    } catch (error) {
        console.error('Database Error: Failed to process withdrawal.', error);
        throw new Error('Failed to process withdrawal.');
    }
}

// --- Admin Functions ---
export async function getAdminDashboardData() {
    await ensureDbSeeded();
    try {
        const usersQuery = sql`SELECT id, name, email, balance, status, referral_earnings FROM users ORDER BY name`;
        const campaignsQuery = sql`SELECT * FROM campaigns ORDER BY user_name`;
        const withdrawalsQuery = sql`SELECT * FROM withdrawals WHERE status = 'pending' ORDER BY created_at ASC`;

        const [usersResult, campaignsResult, withdrawalsResult] = await Promise.all([
            usersQuery,
            campaignsQuery,
            withdrawalsQuery,
        ]);
        
        return {
            users: usersResult.rows as User[],
            campaigns: campaignsResult.rows as Campaign[],
            pendingWithdrawals: withdrawalsResult.rows as Withdrawal[],
        };
    } catch (error) {
        console.error('Failed to fetch admin dashboard data:', error);
        throw new Error('Failed to connect to the database.');
    }
}


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


// --- Article Functions ---

// Function to create a URL-friendly slug from a title
function createSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric characters
    .trim()
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-'); // remove consecutive hyphens
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
        const slug = createSlug(validatedData.title);
        
        await sql`
            INSERT INTO articles (title, content, html_content, keywords, slug, status)
            VALUES (${validatedData.title}, ${validatedData.content}, ${validatedData.html_content}, ${validatedData.keywords}, ${slug}, 'draft')
            ON CONFLICT (slug) DO NOTHING;
        `;
        revalidatePath('/dashboard/admin/articles');
        console.log('Article saved to database successfully.');
    } catch (error) {
        console.error('Database Error: Failed to save article', error);
        throw new Error('Failed to save article to database.');
    }
}

export async function getArticles() {
  await ensureDbSeeded();
  try {
    const { rows } = await sql<Article>`SELECT id, title, slug, status, created_at FROM articles ORDER BY created_at DESC`;
    return rows;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    throw new Error('Failed to fetch articles.');
  }
}

export async function getPublishedArticles() {
  await ensureDbSeeded();
  try {
    const { rows } = await sql<Article>`SELECT title, slug, created_at, content FROM articles WHERE status = 'published' ORDER BY created_at DESC`;
    return rows;
  } catch (error) {
    console.error('Failed to fetch published articles:', error);
    throw new Error('Failed to fetch published articles.');
  }
}

export async function getArticleBySlug(slug: string) {
  await ensureDbSeeded();
  try {
    const { rows } = await sql<Article>`SELECT title, content, html_content, created_at FROM articles WHERE slug = ${slug} AND status = 'published'`;
    return rows[0] || null;
  } catch (error) {
    console.error(`Failed to fetch article by slug "${slug}":`, error);
    throw new Error('Failed to fetch article.');
  }
}

export async function publishArticle(id: string) {
  await ensureDbSeeded();
  try {
    await sql`UPDATE articles SET status = 'published' WHERE id = ${id}`;
    revalidatePath('/dashboard/admin/articles');
    revalidatePath('/blog');
  } catch (error) {
    console.error(`Failed to publish article with id "${id}":`, error);
    throw new Error('Failed to publish article.');
  }
}

export async function deleteArticle(id: string) {
  await ensureDbSeeded();
  try {
    await sql`DELETE FROM articles WHERE id = ${id}`;
    revalidatePath('/dashboard/admin/articles');
  } catch (error) {
    console.error(`Failed to delete article with id "${id}":`, error);
    throw new Error('Failed to delete article.');
  }
}