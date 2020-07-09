var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ========================================================
// Búsqueda por collección
// ========================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i'); // expresión regular key insensitive
    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipo de búsqueda deben ser: usuarios, medicos y hospitales.',
                error: { message: 'Tipo de tabla/colecion no válida.' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});

// ========================================================
// Búsqueda general
// ========================================================
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i'); // expresión regular key insensitive

    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, regject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre apellido email img')
            .exec((err, hospitales) => {
                if (err) {
                    regject('Error al buscar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, regject) => {
        Medico.find({})
            .populate('usuario', 'nombre apellido email img')
            .populate('hospital')
            .or([{ 'nombre': regex }, { 'apellido': regex }])
            .exec((err, medicos) => {
                if (err) {
                    regject('Error al buscar médicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, regject) => {
        Usuario.find({}, 'nombre apellido email img role google')
            .or([{ 'nombre': regex }, { 'apellido': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    regject('Error al buscar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;