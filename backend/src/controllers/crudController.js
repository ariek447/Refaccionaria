/**
 * Genera los controladores HTTP (list, getById, create, update, remove)
 * a partir de un servicio CRUD. Express 5 envía automáticamente al
 * manejador de errores cualquier excepción de una función async.
 *
 * @param {object} service  Servicio creado con createCrudService
 * @param {object} messages Mensajes de éxito del recurso
 */
export function createCrudController(service, messages) {
  return {
    async list(req, res) {
      res.json(await service.findAll());
    },

    async getById(req, res) {
      res.json(await service.findById(req.params.id));
    },

    async create(req, res) {
      res.status(201).json(await service.create(req.body));
    },

    async update(req, res) {
      res.json(await service.update(req.params.id, req.body));
    },

    async remove(req, res) {
      await service.remove(req.params.id);
      res.json({ message: messages.deleted });
    },
  };
}
