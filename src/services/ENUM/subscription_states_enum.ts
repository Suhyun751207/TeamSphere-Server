export const subscription_states_enum = ['Free', 'Pro', 'Team', 'Admin'] as const;


export type SubscriptionState = typeof subscription_states_enum[number]; 
