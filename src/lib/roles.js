export const ROLES = {
  SHOWRUNNER: 'showrunner',
  SENIOR_SHOWRUNNER: 'senior_showrunner',
  ADMIN: 'admin'
};

export const ROLE_LABELS = {
  [ROLES.SHOWRUNNER]: 'Showrunner',
  [ROLES.SENIOR_SHOWRUNNER]: 'Senior Showrunner',
  [ROLES.ADMIN]: 'Admin'
};

// Showrunner: can only add incidents.
// Senior Showrunner: can also edit/delete incidents and decide incentive levels.
// Admin: everything Senior Showrunner can do, plus customize the underlying penalty/incentive amounts.
export function canEditIncidents(role) {
  return role === ROLES.SENIOR_SHOWRUNNER || role === ROLES.ADMIN;
}

export function canDeleteIncidents(role) {
  return role === ROLES.SENIOR_SHOWRUNNER || role === ROLES.ADMIN;
}

export function canSetIncentives(role) {
  return role === ROLES.SENIOR_SHOWRUNNER || role === ROLES.ADMIN;
}

export function canCustomizeRules(role) {
  return role === ROLES.ADMIN;
}
