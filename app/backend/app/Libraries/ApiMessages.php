<?php

namespace App\Libraries;

class ApiMessages
{
    public static function translate(string $message, string $language): ?string
    {
        $translations = [
            'Esperá un momento antes de volver a intentar.' => ['Please wait a moment before trying again.', 'Bitte warte einen Moment, bevor du es erneut versuchst.'],
            'Esperá un momento antes de enviar otro aviso.' => ['Please wait a moment before sending another report.', 'Bitte warte einen Moment, bevor du eine weitere Meldung sendest.'],
            'Completá el nombre, un correo válido y el mensaje.' => ['Enter your name, a valid email address and a message.', 'Gib deinen Namen, eine gültige E-Mail-Adresse und eine Nachricht ein.'],
            'Este perfil ya no está disponible para adopción.' => ['This profile is no longer available for adoption.', 'Dieses Tier steht nicht mehr zur Adoption.'],
            'Tu solicitud quedó registrada.' => ['Your application was recorded.', 'Deine Anfrage wurde gespeichert.'],
            'Completá el albergue, la edad aproximada y la historia.' => ['Enter the shelter, approximate age and story.', 'Gib Tierheim, ungefähres Alter und Geschichte ein.'],
            'Seleccioná un expediente activo de albergue.' => ['Choose an active shelter record.', 'Wähle eine aktive Tierheimakte aus.'],
            'No se pudo publicar el perfil.' => ['The profile could not be published.', 'Das Profil konnte nicht veröffentlicht werden.'],
            'No se pudo retirar el perfil.' => ['The profile could not be unpublished.', 'Das Profil konnte nicht zurückgezogen werden.'],
            'Necesitás una sesión autorizada para gestionar adopciones.' => ['Sign in with an authorized account to manage adoptions.', 'Melde dich mit einem berechtigten Konto an, um Adoptionen zu verwalten.'],
            'Ingresá un correo válido.' => ['Enter a valid email address.', 'Gib eine gültige E-Mail-Adresse ein.'],
            'No encontramos un expediente activo con hogar.' => ['No active record for an animal with a home was found.', 'Es wurde keine aktive Tierakte für ein Tier mit Zuhause gefunden.'],
            'Revisá los filtros del censo.' => ['Check the census filters.', 'Überprüfe die Bestandsfilter.'],
            'Volvé a iniciar sesión para registrar a tu compañero.' => ['Sign in again to register your animal companion.', 'Melde dich erneut an, um dein Tier zu registrieren.'],
            'Revisá los datos. La foto debe ser JPEG, PNG o WebP, pesar hasta 5 MB y medir hasta 4096 × 4096 píxeles.' => ['Check the details. The photo must be JPEG, PNG or WebP, up to 5 MB and 4096 × 4096 pixels.', 'Überprüfe die Angaben. Das Foto muss JPEG, PNG oder WebP sein und darf höchstens 5 MB und 4096 × 4096 Pixel haben.'],
            'Revisá los datos y el tamaño o formato de la foto.' => ['Check the details and the photo size or format.', 'Überprüfe die Angaben sowie Größe und Format des Fotos.'],
            'Este expediente tiene avisos o un perfil de adopción. Archivalo para conservar su historial.' => ['This record has reports or an adoption profile. Archive it to keep its history.', 'Diese Tierakte enthält Meldungen oder ein Adoptionsprofil. Archiviere sie, um den Verlauf zu erhalten.'],
            'No encontramos un expediente activo.' => ['No active record was found.', 'Es wurde keine aktive Tierakte gefunden.'],
            'Código fuera de servicio.' => ['Code out of service.', 'Code außer Betrieb.'],
            'Esta ficha no está disponible.' => ['This profile is unavailable.', 'Dieses Profil ist nicht verfügbar.'],
            'Necesitás una sesión autorizada para realizar esta acción.' => ['Sign in with an authorized account to perform this action.', 'Melde dich mit einem berechtigten Konto an, um diese Aktion auszuführen.'],
            'Escribí una respuesta de hasta 2000 caracteres.' => ['Write a reply of up to 2000 characters.', 'Schreib eine Antwort mit höchstens 2000 Zeichen.'],
            'Tu respuesta quedó registrada.' => ['Your reply was recorded.', 'Deine Antwort wurde gespeichert.'],
            'Este enlace de respuesta no está disponible.' => ['This reply link is unavailable.', 'Dieser Antwortlink ist nicht verfügbar.'],
            'Este correo no admite otro rebote.' => ['This email cannot be marked as bounced again.', 'Diese E-Mail kann nicht erneut als unzustellbar markiert werden.'],
            'Seleccioná un expediente activo.' => ['Choose an active record.', 'Wähle eine aktive Tierakte aus.'],
            'El aviso ya se gestionó o la especie no coincide.' => ['This report was already handled or the species does not match.', 'Diese Meldung wurde bereits bearbeitet oder die Tierart stimmt nicht überein.'],
            'Este código no está disponible.' => ['This code is unavailable.', 'Dieser Code ist nicht verfügbar.'],
            'Revisá los datos requeridos y el formato del correo. Para un extravío, dejá un correo o teléfono.' => ['Check the required details and email format. For a missing animal, provide an email address or phone number.', 'Überprüfe die Pflichtangaben und das E-Mail-Format. Gib bei einem vermissten Tier eine E-Mail-Adresse oder Telefonnummer an.'],
            'Adjuntá una foto JPEG, PNG o WebP de hasta 5 MB y 4096 × 4096 píxeles.' => ['Attach a JPEG, PNG or WebP photo of up to 5 MB and 4096 × 4096 pixels.', 'Füge ein JPEG-, PNG- oder WebP-Foto mit höchstens 5 MB und 4096 × 4096 Pixeln hinzu.'],
            'Tu aviso quedó registrado.' => ['Your report was recorded.', 'Deine Meldung wurde gespeichert.'],
            'Necesitás una sesión autorizada para gestionar los avisos.' => ['Sign in with an authorized account to manage reports.', 'Melde dich mit einem berechtigten Konto an, um Meldungen zu verwalten.'],
            'Usá un usuario de 3 a 40 caracteres y una contraseña de 8 a 72 bytes.' => ['Use a username of 3 to 40 characters and a password of 8 to 72 bytes.', 'Verwende einen Benutzernamen mit 3 bis 40 Zeichen und ein Passwort mit 8 bis 72 Byte.'],
            'Usá un usuario de 3 a 40 caracteres y una contraseña de 4 a 72 bytes.' => ['Use a username of 3 to 40 characters and a password of 4 to 72 bytes.', 'Verwende einen Benutzernamen mit 3 bis 40 Zeichen und ein Passwort mit 4 bis 72 Byte.'],
            'Indique su nombre completo (máximo 120 caracteres).' => ['Enter your full name (up to 120 characters).', 'Geben Sie Ihren vollständigen Namen ein (maximal 120 Zeichen).'],
            'Indique un correo electrónico válido.' => ['Enter a valid email address.', 'Geben Sie eine gültige E-Mail-Adresse ein.'],
            'Use un usuario de 3 a 40 caracteres: letras, números, punto, guion o guion bajo.' => ['Use a 3–40 character username with letters, numbers, dots, hyphens or underscores.', 'Verwenden Sie einen Benutzernamen mit 3–40 Zeichen: Buchstaben, Zahlen, Punkt, Bindestrich oder Unterstrich.'],
            'Use una contraseña de 8 a 72 bytes.' => ['Use a password of 8 to 72 bytes.', 'Verwenden Sie ein Passwort mit 8 bis 72 Byte.'],
            'Use una contraseña de 4 a 72 bytes.' => ['Use a password of 4 to 72 bytes.', 'Verwenden Sie ein Passwort mit 4 bis 72 Byte.'],
            'Las contraseñas no coinciden.' => ['Passwords do not match.', 'Die Passwörter stimmen nicht überein.'],
            'Ese correo electrónico ya está registrado.' => ['That email address is already registered.', 'Diese E-Mail-Adresse ist bereits registriert.'],
            'El usuario o el correo ya están registrados.' => ['The username or email address is already registered.', 'Der Benutzername oder die E-Mail-Adresse ist bereits registriert.'],
            'Ese nombre de usuario no está disponible.' => ['That username is unavailable.', 'Dieser Benutzername ist nicht verfügbar.'],
            'No tenés acceso a la gestión de usuarios.' => ['You cannot access user management.', 'Du hast keinen Zugriff auf die Benutzerverwaltung.'],
            'No tenés permiso para crear usuarios.' => ['You cannot create users.', 'Du darfst keine Benutzer erstellen.'],
            'No podés asignar ese rol.' => ['You cannot assign that role.', 'Du darfst diese Rolle nicht vergeben.'],
            'Revisá el nombre y la foto. Podés subir una foto JPEG, PNG o WebP de hasta 2 MB y 2048 × 2048 píxeles, o quitarla.' => ['Check the name and photo. You can upload or remove a JPEG, PNG or WebP photo of up to 2 MB and 2048 × 2048 pixels.', 'Überprüfe Name und Foto. Du kannst ein JPEG-, PNG- oder WebP-Foto mit höchstens 2 MB und 2048 × 2048 Pixeln hochladen oder entfernen.'],
            'Iniciá sesión para consultar tu perfil.' => ['Sign in to view your profile.', 'Melde dich an, um dein Profil anzusehen.'],
            'El usuario o la contraseña no son correctos.' => ['The username or password is incorrect.', 'Benutzername oder Passwort ist falsch.'],
        ];

        $pair = $translations[$message] ?? null;
        return $pair[$language === 'de' ? 1 : 0] ?? null;
    }
}
