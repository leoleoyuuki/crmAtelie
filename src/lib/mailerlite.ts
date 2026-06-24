// Mock MailerLite client to satisfy TypeScript build requirements

export async function upsertSubscriber(email: string, data: any) {
    console.log('[MailerLite Mock] Upsert subscriber:', email, data);
    return { success: true };
}

export async function addSubscriberToGroup(email: string, groupId: string) {
    console.log('[MailerLite Mock] Add subscriber to group:', email, groupId);
    return { success: true };
}

export async function removeSubscriberFromGroup(email: string, groupId: string) {
    console.log('[MailerLite Mock] Remove subscriber from group:', email, groupId);
    return { success: true };
}
