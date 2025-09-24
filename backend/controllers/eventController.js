const Event = require('../models/Event');

// Crear evento
exports.createEvent = async (req, res) => {
  try {
    const { name, description, date } = req.body;
    const event = new Event({
      name,
      description,
      date,
      createdBy: req.user._id
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar eventos
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'username');
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Registrar asistencia
exports.registerAttendance = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
    if (!event.attendees.includes(req.user._id)) {
      event.attendees.push(req.user._id);
      await event.save();
    }
    res.json({ message: 'Asistencia registrada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
