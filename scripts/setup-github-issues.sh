#!/bin/bash

echo "🐙 Configuración de Issues Automáticos de GitHub"
echo "================================================"

# Verificar si ya existe el token
if [ -f ".github-token" ]; then
    echo "✅ Archivo .github-token ya existe"
    read -p "¿Quieres reemplazarlo? (y/N): " replace
    if [[ ! $replace =~ ^[Yy]$ ]]; then
        echo "Configuración cancelada"
        exit 0
    fi
fi

echo ""
echo "📋 Para crear issues automáticamente necesitas:"
echo "1. Un Personal Access Token de GitHub"
echo "2. Permisos de 'repo' o 'public_repo' en el token"
echo ""
echo "🔗 Crear token en: https://github.com/settings/tokens"
echo ""

read -p "Ingresa tu GitHub Personal Access Token: " -s token
echo ""

if [ -z "$token" ]; then
    echo "❌ Token vacío. Configuración cancelada."
    exit 1
fi

# Guardar el token
echo "$token" > .github-token
echo "✅ Token guardado en .github-token"

# Verificar que esté en .gitignore
if ! grep -q ".github-token" .gitignore; then
    echo ".github-token" >> .gitignore
    echo "✅ Agregado .github-token a .gitignore"
fi

# Hacer el hook ejecutable
chmod +x .husky/post-commit-github-issues

echo ""
echo "🎉 Configuración completada!"
echo ""
echo "📝 El hook creará issues automáticamente para:"
echo "   • TODOs, FIXMEs, HACKs en el código"
echo "   • console.log en archivos de producción"
echo "   • Vulnerabilidades en dependencias"
echo "   • Archivos grandes (>100KB)"
echo ""
echo "🔧 Para activar/desactivar, edita .husky/post-commit"
echo "💡 Los issues se etiquetan como 'auto-generated'"
