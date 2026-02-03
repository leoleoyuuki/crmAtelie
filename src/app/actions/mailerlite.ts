
'use server';

import { 
    addSubscriberToGroup, 
    removeSubscriberFromGroup, 
    upsertSubscriber 
} from '@/lib/mailerlite';

const GROUP_IDS = {
    new: process.env.MAILERLITE_GROUP_ID_NEW || '',
    trial: process.env.MAILERLITE_GROUP_ID_TRIAL || '',
    expired: process.env.MAILERLITE_GROUP_ID_EXPIRED_TRIAL || '',
    subscriber: process.env.MAILERLITE_GROUP_ID_SUBSCRIBER || '',
};

/**
 * Syncs a user to a single specific group by adding them to it and 
 * removing them from all other possible app-related groups.
 */
async function syncUserToSingleGroup(email: string, targetGroupId: string, userData?: { name?: string, phone?: string }) {
    if (!email || !targetGroupId) return;

    try {
        // 1. Ensure subscriber exists and update their details (including phone)
        await upsertSubscriber(email, {
            name: userData?.name,
            fields: userData?.phone ? { phone: userData.phone } : undefined
        });

        // 2. Add to the new target group
        await addSubscriberToGroup(email, targetGroupId);

        // 3. Remove from all other groups sequentially to avoid race conditions
        const otherGroups = Object.values(GROUP_IDS).filter(id => id !== targetGroupId && id !== '');
        
        for (const groupId of otherGroups) {
            await removeSubscriberFromGroup(email, groupId);
        }

    } catch (error) {
        console.error(`[MailerLite Action] Failed to sync ${email} to group ${targetGroupId}:`, error);
    }
}

export async function onUserCreatedAction(email: string, name: string, phone?: string) {
    console.log(`[MailerLite Action] New User: ${email}`);
    await syncUserToSingleGroup(email, GROUP_IDS.new, { name, phone });
}

export async function onTrialStartedAction(email: string, name: string, phone?: string) {
    console.log(`[MailerLite Action] Trial Started: ${email}`);
    await syncUserToSingleGroup(email, GROUP_IDS.trial, { name, phone });
}

export async function onTrialExpiredAction(email: string, name: string, phone?: string) {
    console.log(`[MailerLite Action] Trial Expired: ${email}`);
    await syncUserToSingleGroup(email, GROUP_IDS.expired, { name, phone });
}

export async function onSubscriptionActivatedAction(email: string, name: string, phone?: string) {
    console.log(`[MailerLite Action] Subscription Activated: ${email}`);
    await syncUserToSingleGroup(email, GROUP_IDS.subscriber, { name, phone });
}
