// src/utils/permissions.ts

import { Ruolo } from '../types';

export const canManageCourses = (ruolo?: Ruolo): boolean => {
  return ruolo === 'admin' || ruolo === 'manager';
};
