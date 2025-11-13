
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Transaction, Withdrawal, User, Campaign, Article } from './db';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = 'hagaaty@gmail.com';


// --- DATABASE SIMULATION ---

// This file simulates all database interactions to avoid the need for a live Vercel Postgres connection,
// which was causing runtime errors. The functions mimic the originals but return hardcoded mock data.
// This ensures the application is fully functional for demonstration and development without database dependencies.

// Helper function to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_USER: User = {
    id: '1c82831c-4b68-4e1a-9494-27a3c3b4a5f7',
    name: 'Hagaaty Admin',
    email: 'hagaaty@gmail.com',
    balance: 4.00,
    referral_earnings: 0.00, // Corrected from 25
    status: 'active'
};

let mockTransactions: Transaction[] = [
    { id: 'trans_1', user_id: MOCK_USER.id, amount: 4.00, description: 'Welcome Bonus', created_at: new Date().toISOString() }
];

let mockWithdrawals: Withdrawal[] = [];
let mockArticles: Article[] = [];
let mockCampaigns: Campaign[] = [];

export async function getFinancials() {
    await delay(300);
    console.log("SIMULATING: getFinancials");
    return {
        balance: MOCK_USER.balance,
        referralEarnings: MOCK_USER.referral_earnings,
        transactions: [...mockTransactions],
        withdrawals: [...mockWithdrawals],
    };
}

export async function addTransaction(userId: string, amount: number, description: string) {
    await delay(200);
    console.log("SIMULATING: addTransaction", { userId, amount, description });
    
    if (userId !== MOCK_USER.id) throw new Error("User not found");

    MOCK_USER.balance += amount;
    mockTransactions.push({
        id: `trans_${Date.now()}`,
        user_id: userId,
        amount,
        description,
        created_at: new Date().toISOString()
    });

    revalidatePath('/dashboard/financials');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function requestWithdrawal(amount: number, phoneNumber: string) {
    await delay(500);
    console.log("SIMULATING: requestWithdrawal", { amount, phoneNumber });

    if (amount > MOCK_USER.referral_earnings) {
        throw new Error('Withdrawal amount cannot exceed your available referral earnings.');
    }
    if(amount <= 0) {
        throw new Error('Invalid withdrawal amount.');
    }

    MOCK_USER.referral_earnings -= amount;

    const newWithdrawal: Withdrawal = {
        id: `wd_${Date.now()}`,
        user_id: MOCK_USER.id,
        user_name: MOCK_USER.name,
        amount,
        phone_number: phoneNumber,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    mockWithdrawals.push(newWithdrawal);
    
    if (resend) {
        try {
            await resend.emails.send({
                from: `Hagaaty <noreply@${process.env.RESEND_DOMAIN || 'resend.dev'}>`,
                to: ADMIN_EMAIL,
                subject: 'New Withdrawal Request',
                html: `
                    <h1>New Withdrawal Request</h1>
                    <p>User <strong>${MOCK_USER.name} (${MOCK_USER.email})</strong> has requested a withdrawal.</p>
                    <ul>
                        <li>Amount: <strong>$${amount.toFixed(2)}</strong></li>
                        <li>Vodafone Cash Number: <strong>${phoneNumber}</strong></li>
                    </ul>
                    <p>Please process this payment manually and mark it as completed in the admin dashboard.</p>
                `
            });
            console.log("SIMULATING: Withdrawal request email sent to admin.");
        } catch (error) {
            console.error("Failed to send withdrawal email:", error);
        }
    } else {
         console.log(`\n--- SIMULATED EMAIL ---
        To: ${ADMIN_EMAIL}
        Subject: New Withdrawal Request
        Body: User ${MOCK_USER.name} requested $${amount.toFixed(2)} to phone ${phoneNumber}.
        -----------------------\n`);
    }

    revalidatePath('/dashboard/financials');
    revalidatePath('/dashboard/admin');
}

export async function sendManualTopUpNotification(method: string) {
    if (!resend) {
        console.warn("Resend is not configured. Skipping email notification.");
        return;
    }

    // In a real app, you'd get the current user's details.
    const user = MOCK_USER; 
    
    try {
        await resend.emails.send({
            from: `Hagaaty <noreply@${process.env.RESEND_DOMAIN || 'resend.dev'}>`,
            to: ADMIN_EMAIL,
            subject: `Manual Top-Up Proof Received (${method})`,
            html: `
                <h1>Manual Top-Up Notification</h1>
                <p>User <strong>${user.name} (${user.email})</strong> has indicated they have sent a manual payment via <strong>${method}</strong>.</p>
                <p>Please verify the payment and credit their account from the admin dashboard if the payment is confirmed.</p>
                <p>This is just a notification. The user has been instructed to send proof to your support email.</p>
            `,
        });
        console.log("SIMULATING: Manual top-up notification email sent to admin.");
    } catch (error) {
        console.error("Failed to send manual top-up notification email:", error);
    }
}


export async function processWithdrawal(withdrawalId: string) {
    await delay(300);
    console.log("SIMULATING: processWithdrawal", { withdrawalId });

    const withdrawal = mockWithdrawals.find(w => w.id === withdrawalId);
    if (withdrawal) {
        withdrawal.status = 'completed';
        withdrawal.updated_at = new Date().toISOString();
        revalidatePath('/dashboard/admin');
        revalidatePath('/dashboard/financials');
    } else {
        throw new Error("Withdrawal not found or already processed.");
    }
}

// --- Admin Functions ---
export async function getAdminDashboardData() {
    await delay(400);
    console.log("SIMULATING: getAdminDashboardData");
    return {
        users: [MOCK_USER],
        campaigns: [...mockCampaigns],
        pendingWithdrawals: mockWithdrawals.filter(w => w.status === 'pending'),
    };
}

export async function toggleUserStatus(userId: string, currentStatus: 'active' | 'suspended') {
  await delay(150);
  console.log("SIMULATING: toggleUserStatus", { userId });
  if (userId === MOCK_USER.id) {
    MOCK_USER.status = currentStatus === 'active' ? 'suspended' : 'active';
  }
  revalidatePath('/dashboard/admin');
}

export async function addUserBalance(userId: string, amount: number) {
    console.log("SIMULATING: addUserBalance", { userId, amount });
    const description = `Admin manual credit: $${amount.toFixed(2)}`;
    await addTransaction(userId, amount, description);

    revalidatePath('/dashboard/admin');
    
    // Send email notification to user
    const user = MOCK_USER; // In real app, find user by ID
     if (resend && user) {
        try {
            await resend.emails.send({
                from: `Hagaaty <noreply@${process.env.RESEND_DOMAIN || 'resend.dev'}>`,
                to: user.email,
                subject: 'Your Account Has Been Credited',
                html: `
                    <h1>Balance Update</h1>
                    <p>Hello ${user.name},</p>
                    <p>Your account has been credited with <strong>$${amount.toFixed(2)}</strong>.</p>
                    <p>Your new balance is <strong>$${user.balance.toFixed(2)}</strong>.</p>
                    <p>Thank you for using Hagaaty!</p>
                `
            });
        } catch (error) {
            console.error("Failed to send balance update email:", error);
        }
    }
}

export async function toggleCampaignStatus(campaignId: string, currentStatus: 'active' | 'paused') {
    await delay(150);
    console.log("SIMULATING: toggleCampaignStatus", { campaignId });
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if(campaign) {
        campaign.status = currentStatus === 'active' ? 'paused' : 'active';
    }
    revalidatePath('/dashboard/admin');
}

// --- Article Functions ---
function createSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

const ArticleSchema = z.object({
  title: z.string(),
  content: z.string(),
  html_content: z.string(),
  keywords: z.string(),
});

export async function saveArticle(articleData: z.infer<typeof ArticleSchema>) {
    await delay(200);
    const validatedData = ArticleSchema.parse(articleData);
    const slug = createSlug(validatedData.title);
    
    const existingIndex = mockArticles.findIndex(a => a.slug === slug);
    const newArticle: Article = {
        id: `art_${Date.now()}`,
        ...validatedData,
        slug,
        status: 'draft',
        created_at: new Date()
    };

    if (existingIndex > -1) {
        mockArticles[existingIndex] = { ...mockArticles[existingIndex], ...newArticle, id: mockArticles[existingIndex].id };
    } else {
        mockArticles.push(newArticle);
    }
    
    console.log('SIMULATING: Article saved successfully.', newArticle);
    revalidatePath('/dashboard/admin/articles');
}

export async function getArticles(): Promise<Article[]> {
  await delay(100);
  console.log("SIMULATING: getArticles");
  return [...mockArticles].sort((a,b) => b.created_at.getTime() - a.created_at.getTime());
}

export async function getPublishedArticles(): Promise<Article[]> {
  await delay(100);
  console.log("SIMULATING: getPublishedArticles");
  return mockArticles.filter(a => a.status === 'published').sort((a,b) => b.created_at.getTime() - a.created_at.getTime());
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  await delay(50);
  console.log("SIMULATING: getArticleBySlug", { slug });
  const article = mockArticles.find(a => a.slug === slug && a.status === 'published');
  return article || null;
}

export async function publishArticle(id: string) {
  await delay(150);
  console.log("SIMULATING: publishArticle", { id });
  const article = mockArticles.find(a => a.id === id);
  if (article) {
    article.status = 'published';
    revalidatePath('/dashboard/admin/articles');
    revalidatePath('/blog');
    revalidatePath(`/blog/${article.slug}`);
  }
}

export async function deleteArticle(id: string) {
  await delay(150);
  console.log("SIMULATING: deleteArticle", { id });
  mockArticles = mockArticles.filter(a => a.id !== id);
  revalidatePath('/dashboard/admin/articles');
  revalidatePath('/blog');
}

    