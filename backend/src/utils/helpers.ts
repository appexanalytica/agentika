export const sanitizeUser = (user: any) => ({
  id: user._id?.toString(),
  username: user.username,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName} ${user.lastName}`,
  role: user.role,
  avatar: user.avatar,
  phone: user.phone,
  jobTitle: user.jobTitle,
  department: user.department,
  isActive: user.isActive,
  lastLogin: user.lastLogin,
  preferences: user.preferences,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};

export const getPaginationParams = (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  const sort = query.sort || 'createdAt';
  const order = query.order === 'asc' ? 1 : -1;
  
  return { page, limit, skip, sort: { [sort]: order } };
};

export const buildFilterQuery = (filters: any, schema: any) => {
  const query: any = {};
  
  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    const searchableFields = Object.keys(schema.paths).filter(
      (field) => schema.paths[field].instance === 'String'
    );
    query.$or = searchableFields.map((field) => ({
      [field]: searchRegex,
    }));
  }
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.role) {
    query.role = filters.role;
  }
  
  if (filters.assignedTo) {
    query.assignedTo = filters.assignedTo;
  }
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) {
      query.createdAt.$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      query.createdAt.$lte = new Date(filters.dateTo);
    }
  }
  
  return query;
};
