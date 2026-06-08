# Checklist de integración — Sistema Fernanda Miami

Seguí este checklist en orden. Cada paso tarda entre 5 y 30 minutos.

---

## PASO 1 — MailerLite (30 min)

### 1.1 Crear API Key
1. Ir a [app.mailerlite.com](https://app.mailerlite.com) → Settings → API
2. Crear nueva API key → copiar y guardar en lugar seguro
3. Guardar también como **credencial en n8n** (Settings → Credentials → New → HTTP Header Auth → Value: `Bearer TU_API_KEY`)

### 1.2 Crear grupo "Ebook Miami"
1. MailerLite → Subscribers → Groups → Create group
2. Nombre: `Ebook Miami`
3. Copiar el **ID numérico del grupo** (aparece en la URL al abrirlo)
4. Guardarlo — lo necesitás para los workflows de n8n

### 1.3 Crear Automation (secuencia de emails)
1. MailerLite → Automation → Create new
2. Trigger: **"When subscriber joins a group"** → elegir `Ebook Miami`
3. Cargar los 6 emails del archivo `emails.md` con los delays indicados:
   - Email 1: inmediato
   - Email 2: esperar 2 días
   - Email 3: esperar 3 días (día 5 total)
   - Email 4: esperar 3 días (día 8 total)
   - Email 5: esperar 4 días (día 12 total)
   - Email 6: esperar 3 días (día 15 total)
4. Agregar condición de salida: **"If subscriber has tag 'Cliente-1:1' → exit"**
5. Activar la automation

### 1.4 Subir el PDF del ebook
1. MailerLite → Files → subir el PDF
2. Copiar el link de descarga
3. Usarlo en el Email 1 como destino del botón "Descargar guía"

---

## PASO 2 — Configurar workflows n8n (20 min)

Los 3 workflows ya están creados en tu instancia. Solo falta configurarlos.

**Acceso directo:**
- WF1 (Lead → MailerLite): https://nicocremaschi.app.n8n.cloud/workflow/knS2jhS94zFyAqVB
- WF2 (Pago Stripe → tags): https://nicocremaschi.app.n8n.cloud/workflow/DFqsGLhWoQE9YgcR
- WF3 (Recordatorio semanal): https://nicocremaschi.app.n8n.cloud/workflow/P32ntLdRiBDRe9wP

### 2.1 Workflow 1 — Captura lead
1. Abrir WF1
2. En el nodo HTTP Request (MailerLite):
   - Reemplazar `{{MAILERLITE_API_KEY}}` con tu API key o asignar la credencial creada en el paso 1.1
   - Reemplazar `YOUR_GROUP_ID_HERE` con el ID del grupo "Ebook Miami"
3. Copiar la URL del webhook: `https://nicocremaschi.app.n8n.cloud/webhook/ebook-miami`
4. Pegar esa URL en `index.html` → línea con `N8N_WEBHOOK_URL`
5. Activar el workflow (botón toggle en la esquina superior derecha)

### 2.2 Workflow 2 — Pago Stripe
1. Abrir WF2
2. Reemplazar `{{MAILERLITE_API_KEY}}` y los GROUP IDs
3. Copiar la URL del webhook: `https://nicocremaschi.app.n8n.cloud/webhook/stripe-pago`
4. Guardar para usar en el Paso 4 (Stripe webhook)
5. Activar cuando tengas Stripe configurado

### 2.3 Workflow 3 — Recordatorio semanal
1. Abrir WF3
2. Reemplazar `{{MAILERLITE_API_KEY}}` y GROUP IDs
3. Activar cuando hayas creado la campaña de re-engagement en MailerLite

---

## PASO 3 — Calendly (15 min)

### 3.1 Crear cuenta y evento
1. Ir a [calendly.com](https://calendly.com) → crear cuenta gratuita o Pro
2. Crear nuevo Event Type:
   - Nombre: "Reunión privada 1:1 — Emigrar a Miami"
   - Duración: 40 minutos
   - Formato: Video Call (Zoom o Google Meet)
   - Descripción: "Orientación personalizada desde experiencia real. No asesoría legal ni migratoria profesional."

### 3.2 Integrar pago con Stripe (requiere plan Calendly Standard o Pro)
1. Calendly → Apps → Payments → Stripe
2. Conectar tu cuenta de Stripe
3. Configurar precio: USD 50
4. Activar "Collect payment before booking"
5. Copiar el link del evento

### 3.3 Actualizar las páginas HTML
Reemplazar `TU_LINK_CALENDLY_AQUI` en estos archivos:
- `gracias.html` → línea del botón "Reservar mi reunión privada"
- `reunion.html` → todos los botones `TU_LINK_CALENDLY_AQUI` (hay 3: nav, botón principal, y CTA final)

### 3.4 Activar Calendly inline widget (opcional, más conversión)
En `reunion.html`, descomentar la sección del widget Calendly inline y comentar el placeholder.
Reemplazar `TU_USUARIO` con tu username de Calendly.

---

## PASO 4 — Stripe (10 min)

### 4.1 Configurar cuenta Stripe
1. Ir a [stripe.com](https://stripe.com) → crear cuenta
2. Verificar la cuenta con tus datos

### 4.2 Webhook para n8n
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://nicocremaschi.app.n8n.cloud/webhook/stripe-pago`
3. Events to send: `payment_intent.succeeded`
4. Copiar el **Webhook Signing Secret** (empieza con `whsec_`)
5. Guardarlo en n8n como credencial adicional si querés validar la firma

*(Si usás Calendly con Stripe integrado, el pago lo gestiona Calendly y podés saltar este paso)*

---

## PASO 5 — Hosting de las páginas HTML (15 min)

### Opción A — Vercel (recomendado, gratis)
1. Ir a [vercel.com](https://vercel.com) → Sign up con GitHub
2. New Project → subir la carpeta `fernanda-miami` como repositorio
3. Vercel asigna URL automática (ej: `fernanda-miami.vercel.app`)
4. (Opcional) Conectar dominio personalizado en Settings → Domains

### Opción B — Netlify (también gratis)
1. Ir a [netlify.com](https://netlify.com)
2. Arrastrar la carpeta `fernanda-miami` al panel de Netlify
3. Netlify despliega en segundos con URL automática

### Opción C — GitHub Pages (gratis)
1. Crear repositorio en GitHub
2. Subir los archivos HTML
3. Settings → Pages → Source: main branch
4. URL: `tuusuario.github.io/fernanda-miami`

---

## PASO 6 — Agregar fotos reales

En los 3 archivos HTML, buscar las secciones de placeholder de foto y reemplazarlas:

```html
<!-- Reemplazar esto: -->
<div class="story-photo">
  <span class="story-photo-emoji">🌴👨‍👩‍👧‍👦</span>
  ...
</div>

<!-- Por esto: -->
<img src="foto-familia.jpg" alt="Fernanda y su familia en Miami"
     style="border-radius:20px; width:100%; object-fit:cover; aspect-ratio:4/5;">
```

**Fotos sugeridas:**
- `index.html`: foto familiar en Miami (playa, barrio, o en casa)
- `gracias.html` y `reunion.html`: foto tuya sola o con familia, cálida, casual

---

## PASO 7 — Agregar testimonios reales

En `gracias.html`, reemplazar los 3 testimonios placeholder con reseñas reales de personas que ya hablaron con vos (con permiso de usar su nombre).

---

## PASO 8 — Conectar dominio (opcional, 20 min)

Si tenés dominio propio:
1. En tu hosting (Vercel/Netlify), ir a Settings → Domains
2. Agregar tu dominio
3. Configurar los DNS según indique la plataforma
4. HTTPS se configura automático

Ejemplo: `fernandaemigramiami.com` o `fernanda-miami.com`

---

## CHECKLIST FINAL DE PRUEBAS

Antes de publicar, probar cada paso del flujo completo:

### Flujo de lead
- [ ] Abrir `index.html` en el navegador
- [ ] Completar el formulario con un email de prueba
- [ ] Verificar que redirige a `gracias.html`
- [ ] Verificar que el email llegó al inbox de MailerLite
- [ ] Verificar que el suscriptor quedó en el grupo "Ebook Miami"
- [ ] Verificar que llegó el Email 1 con el link al ebook
- [ ] Verificar que la automation de MailerLite se disparó

### Flujo de compra (probar con tarjeta de test de Stripe)
- [ ] Abrir `reunion.html`
- [ ] Hacer click en "Reservar" → ir a Calendly
- [ ] Completar la reserva con tarjeta de test `4242 4242 4242 4242`
- [ ] Verificar que Stripe generó el evento `payment_intent.succeeded`
- [ ] Verificar que el webhook de n8n se disparó (Executions en n8n)
- [ ] Verificar que el suscriptor en MailerLite recibió el tag "Cliente-1:1"
- [ ] Verificar que salió del grupo "Ebook Miami" y dejó de recibir emails de venta
- [ ] Verificar que llegó el email de confirmación de la reunión

### General
- [ ] El sitio se ve bien en mobile (abrir en el celular)
- [ ] Todos los links funcionan
- [ ] El disclaimer legal aparece en las 3 páginas
- [ ] El link en bio de TikTok apunta a `index.html`

---

## ESTRUCTURA FINAL DE ARCHIVOS

```
fernanda-miami/
├── index.html      ← Landing page (link en bio de TikTok)
├── gracias.html    ← Página de gracias post-ebook
├── reunion.html    ← Página de venta de la reunión 1:1
├── emails.md       ← Textos completos de los 6 emails
└── checklist.md    ← Este archivo
```

---

## FLUJO COMPLETO DEL SISTEMA

```
TikTok Live
    ↓
Link en bio → index.html
    ↓
Formulario (nombre + email)
    ↓
n8n Webhook → MailerLite (agrega al grupo "Ebook Miami")
    ↓
Email 1: Entrega del ebook (inmediato)
    ↓
gracias.html (oferta reunión 1:1)
    ↓
Emails 2-6 (secuencia automática de 15 días)
    ↓
Si compra: Calendly → Stripe → n8n webhook
    → Tag "Cliente-1:1"
    → Sale del grupo "Ebook Miami"
    → Email de confirmación
    ↓
Si no compra: WF3 (recordatorio semanal automático)
```

---

## SOPORTE Y CONTACTO

- **MailerLite docs:** https://developers.mailerlite.com
- **Calendly + Stripe:** https://help.calendly.com/hc/en-us/articles/360056888854
- **Stripe webhooks:** https://stripe.com/docs/webhooks
- **Vercel deploy:** https://vercel.com/docs/getting-started-with-vercel
- **n8n workflows:** https://nicocremaschi.app.n8n.cloud
