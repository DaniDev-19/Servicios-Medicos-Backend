const nodemailer = require('nodemailer');

const enviarValoracion = async (req, res) => {
    const { nombre, puntuacion, comentario } = req.body;

    if (!nombre || !puntuacion || !comentario) {
        return res.status(400).json({ message: 'Todos los campos (nombre, puntuación, comentario) son obligatorios.' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `🌟 Nueva Valoración: Cuidarte Yutong (${puntuacion}/5)`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #CE1126; border-bottom: 2px solid #CE1126; padding-bottom: 10px;">Nueva Valoración del Proyecto</h2>
                    <p>Has recibido una nueva valoración a través de la plataforma <strong>Cuidarte Yutong</strong>.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>👤 Usuario:</strong> ${nombre}</p>
                        <p><strong>⭐ Puntuación:</strong> ${puntuacion} / 5</p>
                        <p><strong>💬 Comentario:</strong></p>
                        <p style="font-style: italic; white-space: pre-wrap;">"${comentario}"</p>
                    </div>
                    
                    <p style="font-size: 0.8rem; color: #777; margin-top: 30px; text-align: center;">
                        Este es un mensaje automático generado por el sistema de servicios médicos.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: 'Tu valoración ha sido enviada exitosamente. ¡Gracias por tu feedback!'
        });

    } catch (error) {
        console.error('Error al enviar correo de valoración:', error);
        res.status(500).json({
            message: 'Hubo un problema al enviar la valoración. Por favor, inténtalo de nuevo más tarde.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    enviarValoracion
};
