// ============================================
// NUMERA - Core Numerology Functions
// ============================================

// Gematría simple (A=1, B=2, ... Z=26)
export const gematria = (str: string): number => {
  return str
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .reduce((sum, char) => sum + (char.charCodeAt(0) - 64), 0);
};

// Dígito raíz (reduce hasta un solo dígito, respetando números maestros)
export const digitRoot = (n: number, respectMaster: boolean = false): number => {
  if (respectMaster && (n === 11 || n === 22 || n === 33)) return n;
  if (n < 10) return n;
  const sum = [...String(n)].reduce((a, b) => a + parseInt(b), 0);
  return digitRoot(sum, respectMaster);
};

// Extraer vocales de un string
export const getVowels = (str: string): string => {
  return str.toUpperCase().replace(/[^AEIOU]/g, '');
};

// Extraer consonantes de un string  
export const getConsonants = (str: string): string => {
  return str.toUpperCase().replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/g, '');
};

// Calcular los 4 números principales
export interface NumerologyProfile {
  lifeNumber: number;        // Número de Vida (fecha nacimiento)
  expressionNumber: number;  // Número de Expresión (nombre completo)
  soulNumber: number;        // Número del Alma (vocales)
  personalityNumber: number; // Número de Personalidad (consonantes)
}

export const calculateProfile = (
  name: string,
  birthDate: Date
): NumerologyProfile => {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = birthDate.getFullYear();
  
  const lifeNumber = digitRoot(day + month + year, true);
  const expressionNumber = digitRoot(gematria(name), true);
  const soulNumber = digitRoot(gematria(getVowels(name)), true);
  const personalityNumber = digitRoot(gematria(getConsonants(name)), true);
  
  return { lifeNumber, expressionNumber, soulNumber, personalityNumber };
};

// Matriz de Pitágoras
export interface PythagorasMatrix {
  matrix: number[][];
  strengths: string[];
  weaknesses: string[];
}

export const calculatePythagorasMatrix = (birthDate: Date): PythagorasMatrix => {
  const dateStr = `${birthDate.getDate()}${birthDate.getMonth() + 1}${birthDate.getFullYear()}`;
  const freq: Record<number, number> = {};
  
  for (let i = 1; i <= 9; i++) freq[i] = 0;
  
  for (const char of dateStr) {
    const digit = parseInt(char);
    if (digit >= 1 && digit <= 9) freq[digit]++;
  }
  
  const matrix = [
    [freq[1], freq[4], freq[7]],
    [freq[2], freq[5], freq[8]],
    [freq[3], freq[6], freq[9]]
  ];
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  const meanings: Record<number, string> = {
    1: 'Carácter/Voluntad',
    2: 'Energía/Magnetismo', 
    3: 'Creatividad/Interés',
    4: 'Salud/Estabilidad',
    5: 'Intuición/Lógica',
    6: 'Trabajo/Compromiso',
    7: 'Suerte/Talento',
    8: 'Responsabilidad/Deber',
    9: 'Memoria/Inteligencia'
  };
  
  for (let i = 1; i <= 9; i++) {
    if (freq[i] >= 2) strengths.push(meanings[i]);
    if (freq[i] === 0) weaknesses.push(meanings[i]);
  }
  
  return { matrix, strengths, weaknesses };
};

// Biorritmos
export const biorhythm = (
  birthDate: Date,
  targetDate: Date,
  cycle: number
): number => {
  const days = Math.floor(
    (targetDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.sin((2 * Math.PI * days) / cycle);
};

export interface BiorhythmData {
  physical: number;
  emotional: number;
  intellectual: number;
  isCritical: { physical: boolean; emotional: boolean; intellectual: boolean };
  powerDay: boolean;
}

export const calculateBiorhythms = (
  birthDate: Date,
  targetDate: Date
): BiorhythmData => {
  const physical = biorhythm(birthDate, targetDate, 23);
  const emotional = biorhythm(birthDate, targetDate, 28);
  const intellectual = biorhythm(birthDate, targetDate, 33);
  
  const isCritical = {
    physical: Math.abs(physical) < 0.1,
    emotional: Math.abs(emotional) < 0.1,
    intellectual: Math.abs(intellectual) < 0.1
  };
  
  const powerDay = physical > 0.7 && emotional > 0.7 || 
                   physical > 0.7 && intellectual > 0.7 ||
                   emotional > 0.7 && intellectual > 0.7;
  
  return { physical, emotional, intellectual, isCritical, powerDay };
};

// Resonancia numérica (fix: usar escala de 9 para rango 0-100%)
export const resonance = (a: number, b: number): number => {
  const rootA = digitRoot(a);
  const rootB = digitRoot(b);
  return Math.round(100 * (1 - Math.abs(rootA - rootB) / 9));
};

// Interpretaciones de números
export const numberMeanings: Record<number, { title: string; description: string }> = {
  1: { title: 'El Líder', description: 'Independencia, originalidad, ambición. Eres pionero y tienes el coraje de abrir nuevos caminos.' },
  2: { title: 'El Diplomático', description: 'Cooperación, equilibrio, sensibilidad. Tu fuerza está en la colaboración y la armonía.' },
  3: { title: 'El Creativo', description: 'Expresión, alegría, comunicación. Tienes el don de inspirar y entretener a otros.' },
  4: { title: 'El Constructor', description: 'Estabilidad, trabajo duro, practicidad. Construyes bases sólidas para el futuro.' },
  5: { title: 'El Aventurero', description: 'Libertad, cambio, versatilidad. Necesitas experiencias nuevas y estimulación constante.' },
  6: { title: 'El Protector', description: 'Responsabilidad, amor, servicio. Tu propósito es cuidar y nutrir a otros.' },
  7: { title: 'El Buscador', description: 'Sabiduría, introspección, análisis. Buscas verdades profundas y conocimiento oculto.' },
  8: { title: 'El Poderoso', description: 'Abundancia, autoridad, logro material. Tienes talento para los negocios y el éxito.' },
  9: { title: 'El Humanitario', description: 'Compasión, generosidad, finalización. Tu misión es servir a la humanidad.' },
  11: { title: 'El Maestro Intuitivo', description: 'Iluminación espiritual, inspiración. Eres un canal para ideas elevadas.' },
  22: { title: 'El Maestro Constructor', description: 'Visión + acción. Puedes manifestar grandes sueños en realidad.' },
  33: { title: 'El Maestro Sanador', description: 'Amor incondicional, enseñanza. Elevas la conciencia de quienes te rodean.' }
};
