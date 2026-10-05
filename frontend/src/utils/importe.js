// Un unico criterio para el importe, definido en el issue #198.
//
// El problema: con `<input type="number">` el navegador solo acepta punto
// decimal y descarta cualquier separador de miles, asi que "10.000" se
// parseaba como 10 y la cotizacion se guardaba con un valor 1000 veces menor,
// sin avisar nada.
//
// Regla: el ULTIMO separador es el punto decimal si lo siguen 1 o 2 digitos;
// todos los anteriores son separadores de miles. Asi el formato argentino
// (24.500,50) y el tecnico (1234.56) dan el mismo resultado, y el valor no
// depende del contexto regional de quien lo escribe.
//
//   24.500,50 -> 24500.5    1.234.567  -> 1234567
//   1,234.56  -> 1234.56    10.000     -> 10000
//   1234,56   -> 1234.56    10,5       -> 10.5
//   24.500    -> 24500      10.5       -> 10.5
//
// Consecuencias asumidas, ya que el importe admite hasta 2 decimales:
//  - Un separador seguido de 3 digitos es siempre de miles, asi que "10,555"
//    vale 10555. Para escribir 10.555 alcanza "10,55" o "10.555,00".
//  - La parte entera tiene que venir bien agrupada ("1.234.567", no
//    "1.2.3"), para no corregir en silencio una errata del usuario.

// Espacios (incluido el duro) que el usuario puede pegarle al valor.
const TRIM = /[\s\u00a0\u202f]/g;
// Solo digitos y separadores: "24.500,50"
const SOLO_NUMERO = /^\d+(?:[.,]\d+)*$/;
// Todos los grupos de a 3: 24.500 / 1,234 / 1.234.567
const SOLO_MILES = /^\d{1,3}(?:[.,]\d{3})+$/;
// Ultimo separador con 1 o 2 decimales; el grupo 1 se lleva los miles.
// El `+` es codicioso a proposito, asi que en "24.500,50" toma "24.500".
const CON_DECIMALES = /^(.+)([.,])(\d{1,2})$/;
// Parte entera valida: sin agrupar ("1234") o bien agrupada ("1.234.567").
// Lo que no vale es medio agrupado ("1.2").
const ENTERA_VALIDA = /^(?:\d+|\d{1,3}(?:[.,]\d{3})+)$/;

/**
 * Convierte lo que escribe el usuario a numero.
 * @param {unknown} valor texto del campo
 * @returns {number|null|undefined} el importe; `undefined` si esta vacio,
 *   `null` si hay texto que no se puede interpretar como numero
 */
export const parseImporte = (valor) => {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
  if (valor === undefined || valor === null) return undefined;
  if (typeof valor !== 'string') return null;

  const limpio = valor.replace(TRIM, '');
  if (limpio === '') return undefined;
  if (!SOLO_NUMERO.test(limpio)) return null;

  if (!/[.,]/.test(limpio)) return Number(limpio);

  if (SOLO_MILES.test(limpio)) {
    return Number(limpio.replace(/[.,]/g, ''));
  }

  const conDecimales = limpio.match(CON_DECIMALES);
  if (conDecimales) {
    const [, entera, , decimales] = conDecimales;
    // Si la entera viene mal agrupada ("1.2") preferimos fallar antes que
    // devolver un numero que el usuario nunca escribio.
    if (!ENTERA_VALIDA.test(entera)) return null;
    return Number(`${entera.replace(/[.,]/g, '')}.${decimales}`);
  }

  return null;
};

/** Formato de ejemplo para el helper del campo. */
export const IMPORTE_EJEMPLO = '24.500,50 o 1234.56';
