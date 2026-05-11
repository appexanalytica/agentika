import { body, param, query, ValidationChain } from 'express-validator';

export const validateRegister: ValidationChain[] = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-z0-9_]+$/)
    .withMessage('Username can only contain lowercase letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required'),
];

export const validateLogin: ValidationChain[] = [
  body('usernameOrEmail')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateUpdateUser: ValidationChain[] = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('phone')
    .optional()
    .trim(),
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }),
];

export const validateIdParam: ValidationChain[] = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

export const validatePagination: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const validateLead: ValidationChain[] = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim(),
  body('companyName')
    .optional()
    .trim(),
  body('source')
    .optional()
    .isIn(['website', 'referral', 'ads', 'linkedin', 'email', 'manual', 'other'])
    .withMessage('Invalid source'),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'archived'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('interest')
    .optional()
    .isIn(['software_factory', 'crm', 'erp', 'ecommerce', 'automation', 'ai_agents', 'consulting', 'other'])
    .withMessage('Invalid interest'),
];

export const validateBlogPost: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 }),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('status')
    .optional()
    .isIn(['draft', 'scheduled', 'published', 'archived'])
    .withMessage('Invalid status'),
];

export const validateTask: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('type')
    .optional()
    .isIn(['call', 'email', 'meeting', 'follow_up', 'proposal', 'internal', 'other'])
    .withMessage('Invalid type'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled', 'overdue'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned user ID'),
];
