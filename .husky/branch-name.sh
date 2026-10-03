# Regla de nombres de rama, compartida por post-checkout, pre-commit y pre-push.
# No es un hook de git: el nombre no coincide con ninguno, asi que husky no lo ejecuta solo.

BRANCH_PATTERN='^(feat|fix|refactor|chore|docs|test|perf|ci)/([A-Z]+-[0-9]+-)?[a-z0-9]+(-[a-z0-9]+)*$'

# Imprime el motivo y devuelve 1 si el nombre no cumple; 0 si cumple.
validate_branch_name() {
  b="$1"

  if ! echo "$b" | grep -qE "$BRANCH_PATTERN"; then
    echo "  Nombre de rama invalido -> $b"
    echo ""
    echo "    Formato: <type>/<descripcion-en-kebab-case>"
    echo "    Types:   feat fix refactor chore docs test perf ci"
    echo "    Ejemplo: feat/user-profile-screen"
    return 1
  fi

  if [ "${#b}" -gt 50 ]; then
    echo "  Nombre de rama demasiado largo -> ${#b} caracteres (maximo 50)"
    return 1
  fi

  return 0
}
