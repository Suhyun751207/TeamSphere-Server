export const genders_enum = ['FEMALE', 'MALE', 'PRIVATE', 'UNSPECIFIED'] as const;


export type Gender = typeof genders_enum[number]; 
