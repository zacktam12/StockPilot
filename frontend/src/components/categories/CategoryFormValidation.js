// Enhanced form validation for category forms
import * as Yup from 'yup';

export const categoryValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Category name must be at least 2 characters long')
    .max(100, 'Category name cannot exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_&().]+$/, 
             'Category name can only contain letters, numbers, spaces, hyphens, underscores, ampersands, parentheses, and periods')
    .required('Category name is required'),
  
  description: Yup.string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters'),
  
  slug: Yup.string()
    .trim()
    .lowercase()
    .matches(/^[a-z0-9\-_]+$/, 
             'Slug can only contain lowercase letters, numbers, hyphens, and underscores')
    .max(100, 'Slug cannot exceed 100 characters'),
  
  parentId: Yup.string()
    .uuid('Parent category ID must be a valid UUID')
    .nullable(),
  
  icon: Yup.string()
    .trim()
    .max(50, 'Icon name cannot exceed 50 characters'),
  
  color: Yup.string()
    .matches(/^#[0-9A-Fa-f]{6}$/, 
             'Color must be a valid hex color code (e.g., #FF5733)'),
  
  sortOrder: Yup.number()
    .integer('Sort order must be a whole number')
    .min(0, 'Sort order cannot be negative')
    .max(9999, 'Sort order cannot exceed 9999')
    .default(0),
  
  isActive: Yup.boolean()
    .default(true),
  
  isVisible: Yup.boolean()
    .default(true),
  
  metaTitle: Yup.string()
    .trim()
    .max(60, 'Meta title cannot exceed 60 characters'),
  
  metaDescription: Yup.string()
    .trim()
    .max(160, 'Meta description cannot exceed 160 characters'),
  
  tags: Yup.array()
    .of(Yup.string().trim().max(30))
    .max(10, 'Cannot have more than 10 tags'),
  
  image: Yup.string()
    .url('Image must be a valid URL'),
  
  customFields: Yup.object()
    .test('max-fields', 'Cannot have more than 20 custom fields', (value) => {
      return !value || Object.keys(value).length <= 20;
    })
});

// Update schema (all fields optional)
export const categoryUpdateValidationSchema = categoryValidationSchema.shape({
  name: Yup.string()
    .trim()
    .min(2, 'Category name must be at least 2 characters long')
    .max(100, 'Category name cannot exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_&().]+$/, 
             'Category name can only contain letters, numbers, spaces, hyphens, underscores, ampersands, parentheses, and periods')
});

// Real-time validation functions
export const validateField = async (field, value, schema) => {
  try {
    await schema.validateAt(field, { [field]: value });
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .replace(/\s+/g, ' ');
};

// Generate slug from name
export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Validate slug format
export const validateSlug = (slug) => {
  const slugRegex = /^[a-z0-9\-_]+$/;
  if (!slugRegex.test(slug)) {
    return {
      isValid: false,
      error: 'Slug can only contain lowercase letters, numbers, hyphens, and underscores'
    };
  }
  return { isValid: true, error: null };
};

// Get category status color
export const getCategoryStatusColor = (isActive) => {
  return isActive ? 'green' : 'red';
};

// Get category status display
export const getCategoryStatusDisplay = (isActive) => {
  return isActive ? 'Active' : 'Inactive';
};

// Get category visibility color
export const getCategoryVisibilityColor = (isVisible) => {
  return isVisible ? 'blue' : 'gray';
};

// Get category visibility display
export const getCategoryVisibilityDisplay = (isVisible) => {
  return isVisible ? 'Visible' : 'Hidden';
};

// Format date for display
export const formatDate = (date) => {
  if (!date) {
    return "No date available";
  }
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

// Format date for input
export const formatDateForInput = (date) => {
  return new Date(date).toISOString().slice(0, 16);
};

// Check if category can be deleted
export const canDeleteCategory = (category) => {
  // Cannot delete if it has products
  if (category.productCount && category.productCount > 0) {
    return {
      canDelete: false,
      reason: 'Category contains products'
    };
  }
  
  // Cannot delete if it has subcategories
  if (category.subCategoryCount && category.subCategoryCount > 0) {
    return {
      canDelete: false,
      reason: 'Category contains subcategories'
    };
  }
  
  return {
    canDelete: true,
    reason: null
  };
};

// Check if category can be edited
export const canEditCategory = (category, user) => {
  // Admin can edit any category
  if (user.role?.role_type === 'admin') return true;
  
  // Staff can edit categories
  if (user.role?.role_type === 'staff') return true;
  
  return false;
};

// Get category hierarchy level
export const getCategoryLevel = (category, allCategories) => {
  if (!category.parentId) return 0;
  
  let level = 0;
  let currentParentId = category.parentId;
  
  while (currentParentId && level < 10) { // Prevent infinite loops
    const parent = allCategories.find(cat => cat.id === currentParentId);
    if (!parent) break;
    
    level++;
    currentParentId = parent.parentId;
  }
  
  return level;
};

// Get category breadcrumb
export const getCategoryBreadcrumb = (category, allCategories) => {
  const breadcrumb = [];
  let currentCategory = category;
  
  while (currentCategory && breadcrumb.length < 10) { // Prevent infinite loops
    breadcrumb.unshift({
      id: currentCategory.id,
      name: currentCategory.name,
      slug: currentCategory.slug
    });
    
    if (currentCategory.parentId) {
      currentCategory = allCategories.find(cat => cat.id === currentCategory.parentId);
    } else {
      break;
    }
  }
  
  return breadcrumb;
};

// Get category tree structure
export const buildCategoryTree = (categories, parentId = null) => {
  return categories
    .filter(category => category.parentId === parentId)
    .map(category => ({
      ...category,
      children: buildCategoryTree(categories, category.id)
    }))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
};

// Flatten category tree
export const flattenCategoryTree = (tree, level = 0) => {
  let flattened = [];
  
  tree.forEach(category => {
    flattened.push({
      ...category,
      level,
      displayName: '  '.repeat(level) + category.name
    });
    
    if (category.children && category.children.length > 0) {
      flattened = flattened.concat(flattenCategoryTree(category.children, level + 1));
    }
  });
  
  return flattened;
};

// Get category statistics
export const getCategoryStats = (categories) => {
  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.isActive).length;
  const inactiveCategories = categories.filter(cat => !cat.isActive).length;
  const parentCategories = categories.filter(cat => !cat.parentId).length;
  const subCategories = categories.filter(cat => cat.parentId).length;
  
  return {
    totalCategories,
    activeCategories,
    inactiveCategories,
    parentCategories,
    subCategories
  };
};

// Validate hex color
export const validateHexColor = (color) => {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  if (!hexRegex.test(color)) {
    return {
      isValid: false,
      error: 'Color must be a valid hex color code (e.g., #FF5733)'
    };
  }
  return { isValid: true, error: null };
};

// Get contrasting text color for background
export const getContrastingTextColor = (hexColor) => {
  // Remove the # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Get category icon options
export const getCategoryIconOptions = () => {
  return [
    'tag', 'shopping-bag', 'package', 'box', 'layers',
    'grid', 'list', 'folder', 'folder-open', 'archive',
    'bookmark', 'star', 'heart', 'thumbs-up', 'award',
    'trophy', 'medal', 'crown', 'gem', 'diamond',
    'shirt', 'shoes', 'watch', 'smartphone', 'laptop',
    'camera', 'headphones', 'gamepad', 'tv', 'monitor',
    'car', 'bike', 'home', 'building', 'store',
    'utensils', 'coffee', 'wine', 'beer', 'pizza'
  ];
};

// Get category color options
export const getCategoryColorOptions = () => {
  return [
    '#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33',
    '#33FFF5', '#FF3357', '#57FF33', '#5733FF', '#F533FF',
    '#FFD700', '#FF6347', '#32CD32', '#1E90FF', '#FF1493',
    '#00CED1', '#FF8C00', '#9932CC', '#8FBC8F', '#F0E68C'
  ];
};

// Validate custom field
export const validateCustomField = (key, value) => {
  if (key.length > 50) {
    return {
      isValid: false,
      error: 'Field name cannot exceed 50 characters'
    };
  }
  
  if (typeof value === 'string' && value.length > 255) {
    return {
      isValid: false,
      error: 'Field value cannot exceed 255 characters'
    };
  }
  
  return { isValid: true, error: null };
};

// Get category type display
export const getCategoryTypeDisplay = (category) => {
  if (!category.parentId) return 'Parent Category';
  return 'Sub Category';
};

// Get category depth
export const getCategoryDepth = (category, allCategories) => {
  return getCategoryLevel(category, allCategories);
};

// Check if category is leaf (no subcategories)
export const isLeafCategory = (category, allCategories) => {
  return !allCategories.some(cat => cat.parentId === category.id);
};

// Get category path string
export const getCategoryPath = (category, allCategories) => {
  const breadcrumb = getCategoryBreadcrumb(category, allCategories);
  return breadcrumb.map(b => b.name).join(' > ');
};

// Validate category name uniqueness
export const validateCategoryNameUniqueness = (name, categories, excludeId = null) => {
  const existingCategory = categories.find(cat => 
    cat.name.toLowerCase() === name.toLowerCase() && cat.id !== excludeId
  );
  
  if (existingCategory) {
    return {
      isValid: false,
      error: 'Category name already exists'
    };
  }
  
  return { isValid: true, error: null };
};

// Validate slug uniqueness
export const validateSlugUniqueness = (slug, categories, excludeId = null) => {
  if (!slug) return { isValid: true, error: null };
  
  const existingCategory = categories.find(cat => 
    cat.slug === slug && cat.id !== excludeId
  );
  
  if (existingCategory) {
    return {
      isValid: false,
      error: 'Category slug already exists'
    };
  }
  
  return { isValid: true, error: null };
};

// Get category suggestions based on search
export const getCategorySuggestions = (searchTerm, categories, limit = 10) => {
  if (!searchTerm) return [];
  
  const term = searchTerm.toLowerCase();
  return categories
    .filter(category => 
      category.name.toLowerCase().includes(term) ||
      category.description?.toLowerCase().includes(term) ||
      category.slug?.toLowerCase().includes(term)
    )
    .slice(0, limit);
};

// Calculate category metrics
export const calculateCategoryMetrics = (categories) => {
  const stats = getCategoryStats(categories);
  
  const avgProductsPerCategory = categories.length > 0 
    ? categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0) / categories.length 
    : 0;
  
  const maxProducts = Math.max(...categories.map(cat => cat.productCount || 0));
  const minProducts = Math.min(...categories.map(cat => cat.productCount || 0));
  
  return {
    ...stats,
    avgProductsPerCategory: Math.round(avgProductsPerCategory * 100) / 100,
    maxProducts,
    minProducts
  };
};

// Get category performance score
export const getCategoryPerformanceScore = (category) => {
  let score = 0;
  
  // Name completeness
  if (category.name) score += 20;
  
  // Description completeness
  if (category.description) score += 15;
  
  // Slug completeness
  if (category.slug) score += 15;
  
  // Icon completeness
  if (category.icon) score += 10;
  
  // Color completeness
  if (category.color) score += 10;
  
  // Meta data completeness
  if (category.metaTitle) score += 15;
  if (category.metaDescription) score += 15;
  
  return score;
};

// Get category performance color
export const getCategoryPerformanceColor = (score) => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'orange';
  return 'red';
};
