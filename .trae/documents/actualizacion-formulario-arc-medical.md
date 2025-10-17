# Actualización del Formulario de Referencia - ARC Medical Center

## 1. Resumen del Proyecto

Actualizar el formulario existente en `formulario.astro` para que incluya todos los campos del formulario de referencia de pacientes de ARC Medical Center, manteniendo el diseño visual actual pero adaptando la estructura de campos para coincidir exactamente con el formulario de referencia médica profesional.

## 2. Objetivos Principales

- **Mantener el diseño visual actual**: Conservar todos los estilos CSS, animaciones y estructura visual existente
- **Actualizar campos del formulario**: Reemplazar los campos actuales con los campos específicos del formulario de ARC Medical Center
- **Funcionalidad de internacionalización**: Asegurar que todos los nuevos campos funcionen correctamente con el botón de cambio de idioma (español/inglés)
- **Validación y funcionalidad**: Mantener la validación HTML5 y la funcionalidad de envío existente

## 3. Estructura de Campos Requerida

### 3.1 Información del Paciente
- **Nombre completo** (First Name, Last Name)
- **Fecha de nacimiento** (Date of Birth)
- **Género** (Gender)
- **Número de teléfono** (Phone Number)
- **Correo electrónico** (Email Address)
- **Dirección completa** (Address, City, State, ZIP Code)
- **Número de Seguro Social** (Social Security Number)
- **Estado civil** (Marital Status)

### 3.2 Información del Seguro
- **Compañía de seguro primario** (Primary Insurance Company)
- **Número de póliza** (Policy Number)
- **Número de grupo** (Group Number)
- **Nombre del titular de la póliza** (Policy Holder Name)
- **Relación con el titular** (Relationship to Policy Holder)
- **Seguro secundario** (Secondary Insurance - si aplica)

### 3.3 Información del Referente/Doctor
- **Nombre del doctor que refiere** (Referring Physician Name)
- **Especialidad** (Specialty)
- **Nombre de la clínica/hospital** (Clinic/Hospital Name)
- **Dirección del referente** (Referring Physician Address)
- **Teléfono del referente** (Referring Physician Phone)
- **Fax del referente** (Referring Physician Fax)
- **NPI del doctor** (Physician NPI Number)

### 3.4 Razón de la Referencia
- **Diagnóstico principal** (Primary Diagnosis)
- **Código ICD-10** (ICD-10 Code)
- **Síntomas principales** (Chief Complaints/Symptoms)
- **Duración de los síntomas** (Duration of Symptoms)
- **Severidad del dolor** (Pain Scale 1-10)
- **Ubicación del dolor/lesión** (Location of Pain/Injury)

### 3.5 Historial Médico
- **Historial médico relevante** (Relevant Medical History)
- **Medicamentos actuales** (Current Medications)
- **Alergias** (Allergies)
- **Cirugías previas** (Previous Surgeries)
- **Tratamientos previos para esta condición** (Previous Treatments)

### 3.6 Información del Accidente (si aplica)
- **Fecha del accidente** (Date of Accident)
- **Tipo de accidente** (Type of Accident)
- **Descripción del accidente** (Accident Description)
- **¿Se reportó a la policía?** (Police Report Filed?)
- **Número de reporte policial** (Police Report Number)

### 3.7 Información Adicional
- **Urgencia de la referencia** (Urgency Level)
- **Servicios solicitados** (Requested Services)
- **Notas adicionales** (Additional Notes)
- **Documentos adjuntos** (Attached Documents)

### 3.8 Consentimientos y Firmas
- **Consentimiento para tratamiento** (Consent for Treatment)
- **Autorización para compartir información médica** (Authorization to Share Medical Information)
- **Consentimiento de privacidad** (Privacy Policy Consent)
- **Firma digital del paciente** (Patient Digital Signature)
- **Fecha de firma** (Date of Signature)

## 4. Especificaciones Técnicas

### 4.1 Internacionalización
Todos los campos deben incluir:
- Claves de traducción en `src/i18n/es.json` y `src/i18n/en.json`
- Atributos `data-i18n` para cambio dinámico de idioma
- Función `t()` para renderizado del lado del servidor

### 4.2 Validación
- **Campos requeridos**: Información básica del paciente, información del referente, razón de referencia
- **Campos opcionales**: Información del seguro secundario, información del accidente
- **Validación HTML5**: Email, teléfono, fecha, números
- **Validación personalizada**: Número de Seguro Social, códigos ICD-10, NPI

### 4.3 Estructura Visual
- **Fieldsets agrupados**: Mantener la estructura actual de fieldsets con leyendas
- **Form rows**: Utilizar la clase `.form-row` existente para campos en línea
- **Responsive design**: Asegurar que funcione en dispositivos móviles
- **Animaciones**: Mantener las animaciones de entrada de fieldsets

## 5. Claves de Traducción Requeridas

### 5.1 Español (es.json)
```json
{
  "formulario_page": {
    "hero": {
      "title": "Formulario de Referencia de Paciente",
      "subtitle": "Complete la información para referir un paciente a ARC Medical Center"
    },
    "patient_info": {
      "title": "Información del Paciente",
      "first_name": "Nombre",
      "last_name": "Apellido",
      "date_of_birth": "Fecha de Nacimiento",
      "gender": "Género",
      "phone": "Teléfono",
      "email": "Correo Electrónico",
      "ssn": "Número de Seguro Social",
      "marital_status": "Estado Civil"
    },
    "insurance": {
      "title": "Información del Seguro",
      "primary_company": "Compañía de Seguro Primario",
      "policy_number": "Número de Póliza",
      "group_number": "Número de Grupo",
      "policy_holder": "Titular de la Póliza",
      "relationship": "Relación con el Titular"
    },
    "referring_physician": {
      "title": "Información del Doctor Referente",
      "name": "Nombre del Doctor",
      "specialty": "Especialidad",
      "clinic_name": "Nombre de la Clínica",
      "phone": "Teléfono",
      "fax": "Fax",
      "npi": "Número NPI"
    },
    "referral_reason": {
      "title": "Razón de la Referencia",
      "primary_diagnosis": "Diagnóstico Principal",
      "icd_code": "Código ICD-10",
      "symptoms": "Síntomas Principales",
      "duration": "Duración de los Síntomas",
      "pain_scale": "Escala de Dolor (1-10)",
      "location": "Ubicación del Dolor"
    },
    "medical_history": {
      "title": "Historial Médico",
      "relevant_history": "Historial Médico Relevante",
      "current_medications": "Medicamentos Actuales",
      "allergies": "Alergias",
      "previous_surgeries": "Cirugías Previas",
      "previous_treatments": "Tratamientos Previos"
    },
    "accident_info": {
      "title": "Información del Accidente (si aplica)",
      "date": "Fecha del Accidente",
      "type": "Tipo de Accidente",
      "description": "Descripción del Accidente",
      "police_report": "¿Se reportó a la policía?",
      "report_number": "Número de Reporte"
    },
    "additional": {
      "title": "Información Adicional",
      "urgency": "Nivel de Urgencia",
      "services": "Servicios Solicitados",
      "notes": "Notas Adicionales",
      "attachments": "Documentos Adjuntos"
    },
    "consent": {
      "title": "Consentimientos y Firma",
      "treatment": "Consiento al tratamiento médico",
      "information_sharing": "Autorizo compartir información médica",
      "privacy": "Acepto la política de privacidad",
      "signature": "Firma Digital",
      "date": "Fecha"
    }
  }
}
```

### 5.2 Inglés (en.json)
```json
{
  "formulario_page": {
    "hero": {
      "title": "Patient Referral Form",
      "subtitle": "Complete the information to refer a patient to ARC Medical Center"
    },
    "patient_info": {
      "title": "Patient Information",
      "first_name": "First Name",
      "last_name": "Last Name",
      "date_of_birth": "Date of Birth",
      "gender": "Gender",
      "phone": "Phone Number",
      "email": "Email Address",
      "ssn": "Social Security Number",
      "marital_status": "Marital Status"
    },
    "insurance": {
      "title": "Insurance Information",
      "primary_company": "Primary Insurance Company",
      "policy_number": "Policy Number",
      "group_number": "Group Number",
      "policy_holder": "Policy Holder Name",
      "relationship": "Relationship to Policy Holder"
    },
    "referring_physician": {
      "title": "Referring Physician Information",
      "name": "Physician Name",
      "specialty": "Specialty",
      "clinic_name": "Clinic/Hospital Name",
      "phone": "Phone Number",
      "fax": "Fax Number",
      "npi": "NPI Number"
    },
    "referral_reason": {
      "title": "Reason for Referral",
      "primary_diagnosis": "Primary Diagnosis",
      "icd_code": "ICD-10 Code",
      "symptoms": "Chief Complaints/Symptoms",
      "duration": "Duration of Symptoms",
      "pain_scale": "Pain Scale (1-10)",
      "location": "Location of Pain/Injury"
    },
    "medical_history": {
      "title": "Medical History",
      "relevant_history": "Relevant Medical History",
      "current_medications": "Current Medications",
      "allergies": "Allergies",
      "previous_surgeries": "Previous Surgeries",
      "previous_treatments": "Previous Treatments"
    },
    "accident_info": {
      "title": "Accident Information (if applicable)",
      "date": "Date of Accident",
      "type": "Type of Accident",
      "description": "Accident Description",
      "police_report": "Police Report Filed?",
      "report_number": "Police Report Number"
    },
    "additional": {
      "title": "Additional Information",
      "urgency": "Urgency Level",
      "services": "Requested Services",
      "notes": "Additional Notes",
      "attachments": "Attached Documents"
    },
    "consent": {
      "title": "Consents and Signature",
      "treatment": "I consent to medical treatment",
      "information_sharing": "I authorize sharing medical information",
      "privacy": "I accept the privacy policy",
      "signature": "Digital Signature",
      "date": "Date"
    }
  }
}
```

## 6. Implementación

### 6.1 Pasos de Desarrollo
1. **Actualizar archivos de traducción** (`es.json` y `en.json`)
2. **Modificar la estructura HTML** en `formulario.astro`
3. **Mantener los estilos CSS existentes**
4. **Probar la funcionalidad de cambio de idioma**
5. **Validar el envío del formulario**
6. **Verificar la responsividad**

### 6.2 Consideraciones Especiales
- **Campos sensibles**: El SSN debe tener validación especial y encriptación
- **Códigos médicos**: Los campos ICD-10 y NPI deben tener formato específico
- **Archivos adjuntos**: Implementar carga de documentos médicos
- **Firma digital**: Mantener la funcionalidad de canvas existente

## 7. Resultado Esperado

Un formulario de referencia médica profesional que:
- Mantiene el diseño visual atractivo actual
- Incluye todos los campos necesarios para una referencia médica completa
- Funciona perfectamente con el sistema de internacionalización
- Es completamente funcional y validado
- Cumple con los estándares médicos profesionales

Este formulario permitirá a los doctores referir pacientes de manera eficiente a ARC Medical Center con toda la información necesaria para brindar el mejor cuidado posible.