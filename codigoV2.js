// Lista de estados posibles para una transferencia.
const statuses = [
  {
    id: 1,
    name: "CREADA",
  },
  {
    id: 2,
    name: "PAGADA",
  },
  {
    id: 3,
    name: "ABORTADA",
  },
  {
    id: 4,
    name: "FINALIZADA",
  },
];

// Lista de transferencias inicial
const transfers = [
  {
    id: 1,
    licensePlate: "LFTS34",
    email: "usuario1@autored.cl",
    status: "CREADA",
  },
  {
    id: 2,
    licensePlate: "LFTS35",
    email: "usuario2@autored.cl",
    status: "ABORTADA",
  },
  {
    id: 3,
    licensePlate: "BDLS99",
    email: "usuario3@autored.cl",
    status: "CREADA",
  },
  {
    id: 4,
    licensePlate: "LFTS34",
    email: "usuario4@autored.cl",
    status: "CREADA",
  },
  {
    id: 5,
    licensePlate: "BDLS99",
    email: "usuario5@autored.cl",
    status: "FINALIZADA",
  },
];

// Escribe tu codigo acá

const listTransfers = (email) => {
  return transfers.filter((transfer) => transfer.email === email);
};

// Crear una función para crear una nueva transferencia validando que todos los datos sean ingresados correctamente.
const createTransfer = (id, licensePlate, email, status) => {
  const validateLicensePlate = (patente) => {
    // Expresión regular para verificar patentes con 4 letras y 2 números
    const patent1 = /^[A-Z]{4}\d{2}$/;

    // Expresión regular para verificar patentes con 2 letras y 4 números
    const patente2 = /^[A-Z]{2}\d{4}$/;

    // Verificar si la patente cumple con alguno de los dos patrones
    if (patente.match(patent1) || patente.match(patente2)) {
      return true;
    } else {
      return false;
    }
  };
  // Todos los campos son requeridos
  if (id && licensePlate && email && status) {
    if (validateLicensePlate(licensePlate) === false) {
      throw new Error("Patente no valida");
    }
    // si la transferencia ya está PAGADA no se permite crear otra con la misma patente

    const pass = transfers.filter(
      (transfer) =>
        transfer.licensePlate == licensePlate && transfer.status == "PAGADA"
    );

    if (pass.length > 0) {
      throw new Error(
        "No se puede crear otra transferencia con la misma patente, ya hay una pagada"
      );
    }

    // se puede crear solo 1 transferencia con misma patente y mismo correo pero si se encuentra si las transferencias que coinciden con licensePlate y email están todas en estado 'FINALIZADA' o 'ABORTADA', entonces se permite crear otra transferencia con misma licensePlate y email
    const access = transfers.filter(
      (transfer) =>
        transfer.licensePlate === licensePlate &&
        transfer.email === email &&
        (transfer.status === "CREADA" || transfer.status === "PAGADA")
    );

    if (access.length > 0) {
      throw new Error(
        "Ya existe una transferencia con esta patente y correo pendiente"
      );
    }
    // si todas las validaciones pasan, se crea la transferencia
    const newTransfer = {
      id: id,
      licensePlate: licensePlate,
      email: email,
      status: status,
    };
    transfers.push(newTransfer);
    return newTransfer;
  } else {
    throw new Error("Todos los campos son requeridos");
  }
};

// Crear una función para pagar una transferencia mediante correo y patente.
const payTransfer = (email, licensePlate) => {
  const transfer = transfers.find(
    (transfer) =>
      transfer.email === email && transfer.licensePlate === licensePlate
  );
  if (!transfer) {
    throw new Error("No se encontró ninguna transferencia con esos datos");
  }
  if (transfer.status === "PAGADA") {
    throw new Error("La transferencia ya ha sido pagada");
  }
  if (transfer.status === "FINALIZADA" || transfer.status === "ABORTADA") {
    throw new Error("La transferencia ya ha sido finalizada o abortada");
  }
  // si la transferencia pasa todas las validaciones, se cambia su estado a "PAGADA"
  transfer.status = "PAGADA";

  //Si hay múltiples transferencias con misma patente y distinto correo, y una de estas transferencias avanza al estado 'PAGADA', entonces todas las otras transferencias cambian al estado 'ABORTADA'.
 
    transfers
      .filter(
        (t) =>
          t.licensePlate === licensePlate &&
          t.email !== email &&
          t.status !== "FINALIZADA"
      )
      .forEach((t) => (t.status = "ABORTADA"));
  

  return transfer;
};



    console.log(transfers);
 

module.exports = {
  payTransfer,
  createTransfer,
  listTransfers,

  transfers,
};
