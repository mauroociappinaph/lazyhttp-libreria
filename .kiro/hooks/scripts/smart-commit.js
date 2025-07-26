#!/usr/bin/env node

/**
 * Script para organizar commits inteligentes
 * Este script analiza los archivos modificados y los agrupa por funcionalidad relacionada
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuración
const SIMILARITY_THRESHOLD = 0.7; // Umbral de similitud para agrupar archivos
const MAX_GROUPS = 5; // Número máximo de grupos a crear

/**
 * Obtiene la lista de archivos modificados
 * @returns {Array<string>} Lista de archivos modificados
 */
function getModifiedFiles() {
  try {
    const output = execSync('git status --porcelain').toString();
    return output
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const status = line.substring(0, 2);
        const filePath = line.substring(3).trim();
        return { status, filePath };
      })
      .filter(file => file.status !== 'D') // Excluir archivos eliminados
      .map(file => file.filePath);
  } catch (error) {
    console.error('Error al obtener archivos modificados:', error.message);
    return [];
  }
}

/**
 * Obtiene el contenido de un archivo
 * @param {string} filePath - Ruta del archivo
 * @returns {string} Contenido del archivo
 */
function getFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error al leer el archivo ${filePath}:`, error.message);
    return '';
  }
}

/**
 * Calcula la similitud entre dos archivos basada en su ruta y contenido
 * @param {string} file1 - Primer archivo
 * @param {string} file2 - Segundo archivo
 * @returns {number} Valor de similitud entre 0 y 1
 */
function calculateFileSimilarity(file1, file2) {
  // Similitud basada en la ruta
  const dir1 = path.dirname(file1);
  const dir2 = path.dirname(file2);
  const ext1 = path.extname(file1);
  const ext2 = path.extname(file2);

  let similarity = 0;

  // Si están en el mismo directorio
  if (dir1 === dir2) {
    similarity += 0.4;
  } else {
    // Calcular similitud de directorios
    const dirs1 = dir1.split(path.sep);
    const dirs2 = dir2.split(path.sep);
    const commonDirs = dirs1.filter(d => dirs2.includes(d)).length;
    const totalDirs = Math.max(dirs1.length, dirs2.length);
    similarity += 0.3 * (commonDirs / totalDirs);
  }

  // Si tienen la misma extensión
  if (ext1 === ext2) {
    similarity += 0.2;
  }

  // Similitud basada en el contenido
  try {
    const content1 = getFileContent(file1);
    const content2 = getFileContent(file2);

    // Análisis simple de contenido
    const words1 = new Set(content1.split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(content2.split(/\s+/).filter(w => w.length > 3));

    let commonWords = 0;
    for (const word of words1) {
      if (words2.has(word)) {
        commonWords++;
      }
    }

    const totalWords = Math.max(words1.size, words2.size);
    if (totalWords > 0) {
      similarity += 0.4 * (commonWords / totalWords);
    }
  } catch (error) {
    // Si hay error al leer los archivos, solo usar similitud de ruta
  }

  return similarity;
}

/**
 * Agrupa archivos relacionados
 * @param {Array<string>} files - Lista de archivos
 * @returns {Array<Array<string>>} Grupos de archivos relacionados
 */
function groupRelatedFiles(files) {
  if (files.length <= 1) {
    return [files];
  }

  // Matriz de similitud
  const similarityMatrix = [];
  for (let i = 0; i < files.length; i++) {
    similarityMatrix[i] = [];
    for (let j = 0; j < files.length; j++) {
      if (i === j) {
        similarityMatrix[i][j] = 1; // Un archivo es 100% similar a sí mismo
      } else if (j < i) {
        similarityMatrix[i][j] = similarityMatrix[j][i]; // La matriz es simétrica
      } else {
        similarityMatrix[i][j] = calculateFileSimilarity(files[i], files[j]);
      }
    }
  }

  // Algoritmo de agrupamiento jerárquico
  let groups = files.map(file => [file]); // Inicialmente cada archivo es su propio grupo

  while (groups.length > 1 && groups.length > MAX_GROUPS) {
    let maxSimilarity = -1;
    let mergeI = -1;
    let mergeJ = -1;

    // Encontrar los dos grupos más similares
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        // Calcular similitud promedio entre grupos
        let groupSimilarity = 0;
        let comparisons = 0;

        for (const fileI of groups[i]) {
          for (const fileJ of groups[j]) {
            const fileIndexI = files.indexOf(fileI);
            const fileIndexJ = files.indexOf(fileJ);
            groupSimilarity += similarityMatrix[fileIndexI][fileIndexJ];
            comparisons++;
          }
        }

        const avgSimilarity = groupSimilarity / comparisons;

        if (avgSimilarity > maxSimilarity && avgSimilarity >= SIMILARITY_THRESHOLD) {
          maxSimilarity = avgSimilarity;
          mergeI = i;
          mergeJ = j;
        }
      }
    }

    // Si no hay grupos suficientemente similares, terminar
    if (maxSimilarity < SIMILARITY_THRESHOLD) {
      break;
    }

    // Fusionar los grupos más similares
    groups[mergeI] = [...groups[mergeI], ...groups[mergeJ]];
    groups.splice(mergeJ, 1);
  }

  return groups;
}

/**
 * Genera un mensaje de commit para un grupo de archivos
 * @param {Array<string>} group - Grupo de archivos
 * @returns {string} Mensaje de commit
 */
function generateCommitMessage(group) {
  // Determinar el tipo de cambio
  const fileTypes = group.map(file => path.extname(file));
  const directories = group.map(file => path.dirname(file));

  let type = 'chore';
  let scope = '';

  // Determinar el tipo basado en los archivos
  if (fileTypes.some(ext => ext === '.ts' || ext === '.tsx')) {
    if (group.some(file => file.includes('test') || file.includes('spec'))) {
      type = 'test';
    } else if (group.some(file => file.includes('fix') || file.includes('bug'))) {
      type = 'fix';
    } else {
      type = 'feat';
    }
  }

  // Determinar el alcance basado en los directorios
  const commonDir = findCommonDirectory(directories);
  if (commonDir && commonDir !== '.') {
    scope = commonDir.split(path.sep).pop();
  }

  // Generar descripción
  let description = '';
  if (type === 'feat') {
    description = `Implementa funcionalidad en ${scope || 'varios componentes'}`;
  } else if (type === 'fix') {
    description = `Corrige errores en ${scope || 'varios componentes'}`;
  } else if (type === 'test') {
    description = `Actualiza pruebas para ${scope || 'varios componentes'}`;
  } else {
    description = `Actualiza ${scope || 'varios componentes'}`;
  }

  return scope ? `${type}(${scope}): ${description}` : `${type}: ${description}`;
}

/**
 * Encuentra el directorio común entre una lista de directorios
 * @param {Array<string>} directories - Lista de directorios
 * @returns {string} Directorio común
 */
function findCommonDirectory(directories) {
  if (directories.length === 0) return '';
  if (directories.length === 1) return directories[0];

  const parts = directories.map(dir => dir.split(path.sep));
  const minLength = Math.min(...parts.map(p => p.length));

  let commonParts = [];
  for (let i = 0; i < minLength; i++) {
    const part = parts[0][i];
    if (parts.every(p => p[i] === part)) {
      commonParts.push(part);
    } else {
      break;
    }
  }

  return commonParts.join(path.sep);
}

/**
 * Función principal
 */
function main() {
  console.log('🔍 Analizando archivos modificados...');
  const modifiedFiles = getModifiedFiles();

  if (modifiedFiles.length === 0) {
    console.log('No hay archivos modificados para commit.');
    return;
  }

  console.log(`📁 Encontrados ${modifiedFiles.length} archivos modificados.`);

  console.log('🧩 Agrupando archivos relacionados...');
  const groups = groupRelatedFiles(modifiedFiles);

  console.log(`✅ Se han creado ${groups.length} grupos de archivos relacionados.`);

  console.log('\n📝 Propuesta de commits:');
  groups.forEach((group, index) => {
    const commitMessage = generateCommitMessage(group);
    console.log(`\n--- Grupo ${index + 1} ---`);
    console.log('Archivos:');
    group.forEach(file => console.log(`  - ${file}`));
    console.log('\nMensaje de commit:');
    console.log(`  ${commitMessage}`);
    console.log('\nComando:');
    console.log(`  git add ${group.join(' ')} && git commit -m "${commitMessage}"`);
  });

  console.log('\n🚀 Para ejecutar estos commits, copia y pega los comandos anteriores.');
}

// Ejecutar el script
main();
