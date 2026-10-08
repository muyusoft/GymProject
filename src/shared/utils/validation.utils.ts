export const validationUtils = {
  /**
   * Valida email
   */
  isValidEmail(email: string): boolean {
    // Cada parte del dominio excluye el punto: así no hay dos formas de repartir el texto y no retrocede.
    const regex = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
    return regex.test(email);
  },

  /**
   * Valida teléfono (formato Ecuador: +593 o 0)
   */
  isValidPhone(phone: string): boolean {
    const regex = /^(\+593|0)\d{9,10}$/;
    return regex.test(phone.replace(/\s|-/g, ""));
  },

  /**
   * Valida URL
   */
  isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Valida que no esté vacío (después de trim)
   */
  isNotEmpty(value: string): boolean {
    return value.trim().length > 0;
  },

  /**
   * Valida longitud mínima
   */
  minLength(value: string, min: number): boolean {
    return value.length >= min;
  },

  /**
   * Valida longitud máxima
   */
  maxLength(value: string, max: number): boolean {
    return value.length <= max;
  },

  /**
   * Valida que sea número
   */
  isNumber(value: any): boolean {
    return (
      !Number.isNaN(Number.parseFloat(value)) && Number.isFinite(Number(value))
    );
  },
};
