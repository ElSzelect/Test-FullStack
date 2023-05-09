const { payTransfer, createTransfer, listTransfers } = require("./codigoV2");

let { transfers } = require("./codigoV2");

describe('listTransfers', () => {
    it('should return an empty array if the email does not match any transfer', () => {
      const email = 'noexistent@autored.cl';
      const result = listTransfers(email);
      expect(result).toEqual([]);
    });
  
    it('should return all transfers matching the email', () => {
      const email = 'usuario1@autored.cl';
      const expected = [
        {
          id: 1,
          licensePlate: 'LFTS34',
          email: 'usuario1@autored.cl',
          status: 'CREADA',
        },
      ];
      const result = listTransfers(email);
      expect(result).toEqual(expected);
    });
  
    it('should return all transfers matching the email, even if there are duplicates', () => {
      const email = 'usuario4@autored.cl';
      const expected = [
        {
          id: 4,
          licensePlate: 'LFTS34',
          email: 'usuario4@autored.cl',
          status: 'CREADA',
        },
      ];
      const result = listTransfers(email);
      expect(result).toEqual(expected);
    });
  
    it('should return all transfers if the email is not provided', () => {
      const expected = transfers;
      const result = listTransfers();
      expect(result).toEqual(expected);
    });
  });

  describe("createTransfer function", () => {
    beforeEach(() => {
      // Reiniciamos los transfers antes de cada test
      jest.resetModules();
    });
  
    test("should create a transfer with valid inputs", () => {
      const id = 6;
      const licensePlate = "BDLS99";
      const email = "usuario6@autored.cl";
      const status = "CREADA";
  
      const result = createTransfer(id, licensePlate, email, status);
  
      expect(result).toMatchObject({
        id,
        licensePlate,
        email,
        status,
      });
    });
  
    test("should throw an error with incomplete inputs", () => {
      expect(() => {
        createTransfer();
      }).toThrow("Todos los campos son requeridos");
  
      expect(() => {
        createTransfer(1, "LFTS34", "usuario1@autored.cl");
      }).toThrow("Todos los campos son requeridos");
  
      expect(() => {
        createTransfer(1, "LFTS34", "", "CREADA");
      }).toThrow("Todos los campos son requeridos");
    });
  
    test("should throw an error with invalid licensePlate", () => {
      expect(() => {
        createTransfer(1, "invalidPlate", "usuario1@autored.cl", "CREADA");
      }).toThrow("Patente no valida");
    });
  
    test("should throw an error with an already paid transfer with the same licensePlate", () => {
      // Se crea una transferencia con patente "LFTS34" y estado "PAGADA"
      createTransfer(1, "LFTS34", "usuario1@autored.cl", "PAGADA");
  
      // Se intenta crear otra transferencia con la misma patente
      expect(() => {
        createTransfer(2, "LFTS34", "usuario2@autored.cl", "CREADA");
      }).toThrow(
        "No se puede crear otra transferencia con la misma patente, ya hay una pagada"
      );
    });
  
    test("should throw an error with a pending transfer with the same licensePlate and email", () => {
      // Se crea una transferencia con patente "BDLS99", correo "usuario3@autored.cl"
      // y estado "CREADA"
      createTransfer(1, "BDLS99", "usuario3@autored.cl", "CREADA");
  
      // Se intenta crear otra transferencia con la misma patente y correo
      expect(() => {
        createTransfer(2, "BDLS99", "usuario3@autored.cl", "CREADA");
      }).toThrow(
        "Ya existe una transferencia con esta patente y correo pendiente"
      );
    });
    test("should allow creating a transfer with the same licensePlate and email if all previous transfers with the same data are in 'FINALIZADA' or 'ABORTADA' state", () => {
        const id = 6;
        const licensePlate = "BDLS99";
        const email = "usuario3@autored.cl";
        const status = "CREADA";
      
        // Agregamos una transferencia con la misma patente y correo en estado FINALIZADA
        transfers.push({
          id: 7,
          licensePlate: "BDLS99",
          email: "usuario3@autored.cl",
          status: "FINALIZADA",
        });
      
        // Creamos otra transferencia con la misma patente y correo
        const newTransfer = createTransfer(id, licensePlate, email, status);
      
        // Verificamos que se haya creado correctamente
        expect(newTransfer).toEqual({
          id: 6,
          licensePlate: "BDLS99",
          email: "usuario3@autored.cl",
          status: "CREADA",
        });
        expect(transfers.length).toEqual(6);
      });
    })
