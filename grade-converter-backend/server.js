const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/gradeDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB schema
const studentSchema = new mongoose.Schema({
  name: String,
  mathGrade: Number,
  scienceGrade: Number,
  englishGrade: Number,
  mathLetterGrade: String,
  scienceLetterGrade: String,
  englishLetterGrade: String,
});

const Student = mongoose.model('Student', studentSchema);

// Helper function to convert numerical grades to letter grades
const convertToLetterGrade = (grade) => {
  if (grade >= 90) return 'A';
  if (grade >= 80) return 'B';
  if (grade >= 70) return 'C';
  if (grade >= 60) return 'D';
  return 'F';
};

// API endpoints
// Get all students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new student
app.post('/students', async (req, res) => {
  const { name, mathGrade, scienceGrade, englishGrade } = req.body;

  const student = new Student({
    name,
    mathGrade,
    scienceGrade,
    englishGrade,
    mathLetterGrade: convertToLetterGrade(mathGrade),
    scienceLetterGrade: convertToLetterGrade(scienceGrade),
    englishLetterGrade: convertToLetterGrade(englishGrade),
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a student
app.put('/students/:id', async (req, res) => {
  const { id } = req.params;
  const { mathGrade, scienceGrade, englishGrade } = req.body;

  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.mathGrade = mathGrade;
    student.scienceGrade = scienceGrade;
    student.englishGrade = englishGrade;
    student.mathLetterGrade = convertToLetterGrade(mathGrade);
    student.scienceLetterGrade = convertToLetterGrade(scienceGrade);
    student.englishLetterGrade = convertToLetterGrade(englishGrade);

    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a student
app.delete('/students/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
