const { payTransfer, createTransfer, listTransfers } = require("./codigoV2");

let { transfers } = require("./codigoV2");

describe("listTransfers function", () => {
  it("should return an empty array if there are no transfers for the given email", () => {
    const result = listTransfers("nonexistent@autored.cl");
    expect(result).toEqual([]);
  });

  it("should return an array with transfers for the given email", () => {
    const result = listTransfers("usuario3@autored.cl");
    expect(result).toEqual([
      {
        id: 3,
        licensePlate: "BDLS99",
        email: "usuario3@autored.cl",
        status: "CREADA",
      },
    ]);
  });

  it("should return an array with multiple transfers for the given email, in the order they appear in the original array", () => {
    const result = listTransfers("usuario4@autored.cl");
    expect(result).toEqual([
      {
        id: 4,
        licensePlate: "LFTS34",
        email: "usuario4@autored.cl",
        status: "CREADA",
      },
    ]);
  });
});

describe("createTransfer", () => {
  beforeEach(() => {
    // reset transfers array before each test
    transfers.length = 0;
  });

  it("should create a new transfer with valid input", () => {
    const newTransfer = createTransfer(
      1,
      "ABCD12",
      "user1@autored.cl",
      "CREADA"
    );
    expect(newTransfer).toEqual({
      id: 1,
      licensePlate: "ABCD12",
      email: "user1@autored.cl",
      status: "CREADA",
    });
    expect(transfers).toEqual([newTransfer]);
  });

  it("should throw an error if license plate is not valid", () => {
    expect(() =>
      createTransfer(1, "1234", "user1@autored.cl", "CREADA")
    ).toThrowError("Patente no valida");
    expect(transfers).toEqual([]);
  });

  it("should throw an error if a transfer with the same license plate is already paid", () => {
    transfers.push({
      id: 1,
      licensePlate: "ABCD12",
      email: "user1@autored.cl",
      status: "PAGADA",
    });
    expect(() =>
      createTransfer(2, "ABCD12", "user2@autored.cl", "CREADA")
    ).toThrowError(
      "No se puede crear otra transferencia con la misma patente, ya hay una pagada"
    );
    expect(transfers).toEqual([
      {
        id: 1,
        licensePlate: "ABCD12",
        email: "user1@autored.cl",
        status: "PAGADA",
      },
    ]);
  });

  it("should throw an error if there is already a pending transfer with the same license plate and email", () => {
    transfers.push({
      id: 1,
      licensePlate: "ABCD12",
      email: "user1@autored.cl",
      status: "CREADA",
    });
    expect(() =>
      createTransfer(2, "ABCD12", "user1@autored.cl", "CREADA")
    ).toThrowError(
      "Ya existe una transferencia con esta patente y correo pendiente"
    );
    expect(transfers).toEqual([
      {
        id: 1,
        licensePlate: "ABCD12",
        email: "user1@autored.cl",
        status: "CREADA",
      },
    ]);
  });

  it("should allow creating a new transfer with the same license plate and email if all previous transfers are either 'FINALIZADA' or 'ABORTADA'", () => {
    transfers.push({
      id: 1,
      licensePlate: "ABCD12",
      email: "user1@autored.cl",
      status: "FINALIZADA",
    });
    transfers.push({
      id: 2,
      licensePlate: "ABCD12",
      email: "user1@autored.cl",
      status: "ABORTADA",
    });
    const newTransfer = createTransfer(
      3,
      "ABCD12",
      "user1@autored.cl",
      "CREADA"
    );
    expect(newTransfer).toEqual({
      id: 3,
      licensePlate: "ABCD12",
      email: "user1@autored.cl",
      status: "CREADA",
    });
    expect(transfers).toEqual([
      {
        id: 1,
        licensePlate: "ABCD12",
        email: "user1@autored.cl",
        status: "FINALIZADA",
      },
      {
        id: 2,
        licensePlate: "ABCD12",
        email: "user1@autored.cl",
        status: "ABORTADA",
      },
      newTransfer,
    ]);
  });

  it("should throw an error if any input field is missing", () => {
    expect(() => createTransfer()).toThrow("Todos los campos son requeridos");
    expect(() => createTransfer(1)).toThrow("Todos los campos son requeridos");
    expect(() => createTransfer(1, "LFTS34")).toThrow(
      "Todos los campos son requeridos"
    );
    expect(() => createTransfer(1, "LFTS34", "usuario1@autored.cl")).toThrow(
      "Todos los campos son requeridos"
    );
    expect(() =>
      createTransfer(1, "LFTS34", "usuario1@autored.cl", "CREADA")
    ).not.toThrow();
  });

  it("should allow creating a new transfer if all validations pass", () => {
    transfers.push({
      id: 1,
      licensePlate: "LFTS34",
      email: "usuario1@autored.cl",
      status: "FINALIZADA",
    });
    transfers.push({
      id: 2,
      licensePlate: "LFTS34",
      email: "usuario1@autored.cl",
      status: "ABORTADA",
    });
    expect(() =>
      createTransfer(3, "LFTS34", "usuario1@autored.cl", "CREADA")
    ).not.toThrow();
  });
});

describe("payTransfer", () => {
  beforeEach(() => {
    transfers.splice(0, transfers.length);
    transfers.push(
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
      }
    );
  });

  it("should throw an error if no transfer is found with the given email and license plate", () => {
    expect(() => payTransfer("usuario1@autored.cl", "BDLS00")).toThrow(
      "No se encontró ninguna transferencia con esos datos"
    );
  });

  it("should throw an error if the transfer has already been paid", () => {
    expect(() => payTransfer("usuario1@autored.cl", "LFTS34")).toThrow(
      "La transferencia ya ha sido pagada"
    );
  });

  it("should throw an error if the transfer has already been finished or aborted", () => {
    expect(() => payTransfer("usuario5@autored.cl", "BDLS99")).toThrow(
      "La transferencia ya ha sido pagada"
    );
  });

  it("should change the status of the transfer to 'PAGADA'", () => {
    const transfer = payTransfer("usuario1@autored.cl", "LFTS34");
    expect(transfer.status).toBe("PAGADA");
  });

  it("should change the status of all transfers with the same license plate and different email to 'ABORTADA' if one of them is paid", () => {
    payTransfer("usuario3@autored.cl", "BDLS99");
    const abortedTransfers = transfers.filter(
      (transfer) =>
        transfer.licensePlate === "BDLS99" && transfer.status === "ABORTADA"
    );
    expect(abortedTransfers.length).toBe(1);
  });
});
