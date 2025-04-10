// Ejemplo de uso del sistema de autenticación de LazyHTTP
const { http } = require("../");

// Función para configurar la autenticación
async function setupAuthentication() {
  console.log("Configurando sistema de autenticación...");

  // Configuración personalizada
  http.configureAuth({
    type: "jwt",
    endpoints: {
      token: "/api/auth/login", // Endpoint para login
      refresh: "/api/auth/refresh", // Endpoint para refrescar token
      logout: "/api/auth/logout", // Endpoint para cerrar sesión
      userInfo: "/api/auth/user", // Endpoint para obtener info del usuario
    },
    storage: "localStorage", // Tipo de almacenamiento
    autoRefresh: true, // Refrescar automáticamente tokens
    tokenKeys: {
      accessToken: "access_token", // Nombre personalizado para tokens
      refreshToken: "refresh_token",
    },
  });

  // Inicializar la librería
  await http.initialize();

  console.log("✅ Sistema de autenticación configurado");
}

// Función para iniciar sesión
async function login() {
  console.log("Iniciando sesión...");

  try {
    // Credenciales del usuario
    const credentials = {
      username: "usuario@ejemplo.com",
      password: "contraseña123",
    };

    // Llamar a la API de login
    const authInfo = await http.login(credentials);

    console.log("✅ Sesión iniciada con éxito");
    console.log("Token:", authInfo.accessToken.substring(0, 20) + "...");
    console.log("Expira en:", new Date(authInfo.expiresAt).toLocaleString());

    return true;
  } catch (error) {
    console.error("❌ Error al iniciar sesión:", error.message);
    return false;
  }
}

// Función para obtener datos protegidos
async function getProtectedData() {
  console.log("Obteniendo datos protegidos...");

  // Verificar si está autenticado
  if (!http.isAuthenticated()) {
    console.warn("⚠️ No hay sesión activa");
    return null;
  }

  try {
    // Realizar petición con autenticación
    const response = await http.get("/api/protected-data", { withAuth: true });

    if (response.error) {
      console.error("❌ Error al obtener datos:", response.error);
      return null;
    }

    console.log("✅ Datos protegidos obtenidos");
    return response.data;
  } catch (error) {
    console.error("❌ Error inesperado:", error.message);
    return null;
  }
}

// Función para obtener información del usuario
async function getUserInfo() {
  console.log("Obteniendo información del usuario...");

  try {
    const user = await http.getAuthenticatedUser();

    if (!user) {
      console.warn("⚠️ No se pudo obtener información del usuario");
      return null;
    }

    console.log("✅ Información del usuario:");
    console.log("  Nombre:", user.name);
    console.log("  Email:", user.email);
    console.log("  Roles:", user.roles?.join(", "));

    return user;
  } catch (error) {
    console.error(
      "❌ Error al obtener información del usuario:",
      error.message
    );
    return null;
  }
}

// Función para cerrar sesión
async function logout() {
  console.log("Cerrando sesión...");

  try {
    await http.logout();
    console.log("✅ Sesión cerrada con éxito");
    return true;
  } catch (error) {
    console.error("❌ Error al cerrar sesión:", error.message);
    return false;
  }
}

// Función principal
async function runAuthExample() {
  try {
    // Paso 1: Configurar sistema de autenticación
    await setupAuthentication();

    // Paso 2: Iniciar sesión
    const loggedIn = await login();
    if (!loggedIn) return;

    // Paso 3: Obtener datos protegidos
    const protectedData = await getProtectedData();
    console.log("Datos protegidos:", protectedData);

    // Paso 4: Obtener información del usuario
    const userInfo = await getUserInfo();

    // Paso 5: Cerrar sesión
    await logout();

    // Paso 6: Verificar que ya no está autenticado
    const isAuth = http.isAuthenticated();
    console.log("¿Todavía autenticado?", isAuth ? "Sí" : "No");
  } catch (error) {
    console.error("Error en el ejemplo de autenticación:", error);
  }
}

// Simulación para fines del ejemplo
// En un entorno real, esto no sería necesario
if (typeof window === "undefined") {
  // Crear un localStorage global compartido
  if (!global.localStorage) {
    global.localStorage = {
      _data: {},
      setItem(id, val) {
        this._data[id] = String(val);
      },
      getItem(id) {
        return this._data[id] || null;
      },
      removeItem(id) {
        delete this._data[id];
      },
      clear() {
        this._data = {};
      },
    };
  }

  // En lugar de forzar siempre true
  let isUserLoggedOut = false;

  http.isAuthenticated = () => {
    return !isUserLoggedOut;
  };

  // Y en la función de logout simulada
  const originalLogout = http.logout;
  http.logout = async () => {
    isUserLoggedOut = true;
    // resto del código...
  };

  // Simular respuestas para el ejemplo
  const originalGet = http.get;
  http.get = async (endpoint, options) => {
    if (endpoint === "/api/protected-data" && options?.withAuth) {
      return {
        data: { message: "Estos son datos protegidos", secret: "12345" },
        error: null,
        status: 200,
      };
    }
    return originalGet.call(http, endpoint, options);
  };

  const originalLogin = http.login;
  http.login = async (credentials) => {
    // Simulación de login exitoso
    return {
      accessToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      refreshToken: "refresh-token-dummy",
      expiresAt: Date.now() + 3600000, // Expira en 1 hora
      isAuthenticated: true,
      user: {
        name: "John Doe",
        email: "usuario@ejemplo.com",
        roles: ["user", "admin"],
      },
    };
  };

  const originalGetAuthUser = http.getAuthenticatedUser;
  http.getAuthenticatedUser = async () => {
    if (http.isAuthenticated()) {
      return {
        name: "John Doe",
        email: "usuario@ejemplo.com",
        roles: ["user", "admin"],
      };
    }
    return null;
  };
}

// Ejecutar el ejemplo
runAuthExample();
