
export const validateBIN = (bin: string): { isValid: boolean; message?: string } => {
  const cleanBIN = bin.replace(/[-\s]/g, '');
  if (!cleanBIN) return { isValid: false, message: 'BIN is required' };
  
  // Bangladesh BIN is usually 11 or 13 digits
  if (!/^\d{11}$|^\d{13}$/.test(cleanBIN)) {
    return { isValid: false, message: 'BIN must be 11 or 13 digits' };
  }
  return { isValid: true };
};

export const validateTIN = (tin: string): { isValid: boolean; message?: string } => {
  const cleanTIN = tin.replace(/[-\s]/g, '');
  if (!cleanTIN) return { isValid: false, message: 'TIN is required' };
  
  // Bangladesh TIN is usually 12 digits
  if (!/^\d{12}$/.test(cleanTIN)) {
    return { isValid: false, message: 'TIN must be 12 digits' };
  }
  return { isValid: true };
};

export const validateAmount = (amount: number | string): { isValid: boolean; message?: string } => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return { isValid: false, message: 'Must be a valid number' };
  if (num < 0) return { isValid: false, message: 'Amount cannot be negative' };
  return { isValid: true };
};

export const validateDate = (dateStr: string): { isValid: boolean; message?: string } => {
  if (!dateStr) return { isValid: false, message: 'Date is required' };
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return { isValid: false, message: 'Invalid date format' };
  
  // Prevent dates too far in the future (e.g., more than 10 years)
  const tenYearsFromNow = new Date();
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
  if (date > tenYearsFromNow) return { isValid: false, message: 'Date is too far in the future' };
  
  return { isValid: true };
};

export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email) return { isValid: true }; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }
  return { isValid: true };
};
