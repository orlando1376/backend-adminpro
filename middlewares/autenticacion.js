var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ========================================================
// Verificar token
// ========================================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decode) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto.',
                errors: err
            });
        }

        req.usuario = decode.usuario;

        next();
    });
};

// ========================================================
// Verificar ADMIN_ROLE
// ========================================================
exports.verificaADMIN_ROLE = function(req, res, next) {
    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador.',
            errors: { message: 'No es administrador.' }
        });
    }
};

// ========================================================
// Verificar ADMIN_ROLE o mismo usuario
// ========================================================
exports.verificaADMIN_ROLE_o_MismoUsuario = function(req, res, next) {
    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador ni es el mismo usuario.',
            errors: { message: 'No es administrador ni es el mismo usuario.' }
        });
    }
};