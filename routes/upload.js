var express = require('express');
var fileupload = require('express-fileupload');
var fs = require('fs');
var app = express();
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileupload());

app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;
    var tiposValidos = ['usuarios', 'medicos', 'hospitales'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida.',
            errors: { message: 'Las colecciones válidas son: ' + tiposValidos.join(', ') }
        })
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se seleccionó un archivo.',
            errors: { message: 'Debe seleccionar una imagen.' }
        });
    }

    // obtener nombre y extensión del archivo
    var archivo = req.files.Imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //extensiones válidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida.',
            errors: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });
    }

    // nombre personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    var path = `./uploads/${tipo}/${nombreArchivo}`;

    // mover archivo
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo.',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Petición realizada correctamente.',
        //     extensionArchivo: extensionArchivo
        // });

    });

});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {
                if (!usuario) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El usuario no existe.',
                        errors: { message: 'El usuario no existe' }
                    });
                }

                var pathViejo = './uploads/usuarios/' + usuario.img;

                // eliminar imagen vieja
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }

                usuario.img = nombreArchivo;

                usuario.save((err, usuarioActualizado) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar imagen de usuario.',
                            errors: err
                        });
                    }

                    usuarioActualizado.password = ':)';

                    res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada.',
                        usuario: usuarioActualizado
                    });

                });
            });
            break;
        case 'medicos':
            Medico.findById(id, (err, medico) => {
                if (!medico) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El médico no existe.',
                        errors: { message: 'El médico no existe' }
                    });
                }

                var pathViejo = './uploads/medicos/' + medico.img;

                // eliminar imagen vieja
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }

                medico.img = nombreArchivo;

                medico.save((err, medicoActualizado) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar imagen de medico.',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada.',
                        medico: medicoActualizado
                    });

                });
            });
            break;
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {
                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El hospital no existe.',
                        errors: { message: 'El hospital no existe' }
                    });
                }

                var pathViejo = './uploads/hospitales/' + hospital.img;

                // eliminar imagen vieja
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }

                hospital.img = nombreArchivo;

                hospital.save((err, hospitalActualizado) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar imagen de hospital.',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada.',
                        hospital: hospitalActualizado
                    });

                });
            });
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Tipo de colección no es válida.',
                errors: { message: 'Las colecciones válidas son: ' + tiposValidos.join(', ') }
            });
    }
}

module.exports = app;