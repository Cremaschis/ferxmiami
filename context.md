# CONTEXTO PROYECTO FERNANDA MIAMI — SESIÓN 2026-06-04

## RESUMEN GENERAL
Sistema completo de ventas automatizado para asesorías 1:1 de emigración a Miami (USD 57, 40 min). Incluye landing page, ebook PDF premium, secuencia de emails automática y integración de pagos. **Estado actual: 95% funcional, bloqueado por expiración de trial de n8n Cloud**.

---

## ARQUIVOS CREADOS/MODIFICADOS

### HTML (Vercel deployment)
- **index.html** (landing page)
  - Formulario captura email+nombre
  - Webhook URL: `https://nicocremaschi.app.n8n.cloud/webhook/ebook-miami`
  - CTA principal: "Descargar guía gratis"
  - Navbar con botones Inicio/Hablemos
  - Foto de Fer en NY (8d411f6b-707c-4744-ab7f-286548906cd2.jpg)
  - Tipografía: Outfit (headers) + Inter (body)
  - Sin emojis, SVG icons

- **gracias.html** (thank you page post-ebook)
  - Confirmación de descarga
  - Oferta CTA para reunión USD 57
  - Navbar con botones Inicio/Hablemos
  - Testimonios con estrellas SVG (5★)
  - Tipografía actualizada a Outfit

- **reunion.html** (sales page 1:1)
  - Hero oscuro con foto familia en Miami (9f86d178-6eeb-473d-999b-c99546c4dc65.jpg)
  - Meta: 40 min, USD 57, 1:1 privada
  - 6 features checkmark con SVG
  - Includes/Not includes comparison
  - 2 botones CTA:
    - Calendly (PayPal/tarjeta): `https://calendly.com/ferxmiami/new-meeting`
    - MercadoPago: `https://mpago.la/1uxfiyH`
  - QR code (dinámico via qrserver)
  - Navbar con botones Inicio/Hablemos
  - Tipografía: Outfit

- **ebook.html** (PDF para generación)
  - 6 páginas A4 (descargable como PDF)
  - Tipografía: Outfit (sans-serif moderna, legible)
  - Sin emojis, SVG icons reemplazados
  - Página 1: Portada con imagen Miami
  - Página 2: Welcome con foto Fer (57b29b97)
  - Página 3: Tabla de contenidos
  - Página 4: Verdades (4 items)
  - Página 5: Miami en concreto (6 features)
  - Página 6: CTA con QR + link clickeable a `/reunion`
  - PDF final: 1.78 MB, generado via Chrome headless

### PDFs
- **TU CAMINO A MIAMI.pdf** (1.78 MB)
- **guia-miami.pdf** (copia con URL-friendly name)
  - Alojado en Vercel: `https://fernanda-miami.vercel.app/guia-miami.pdf`

### n8n Workflows (Cloud — ACTIVOS pero TRIAL EXPIRADO)
1. **[Webhook] Captura lead ebook Miami** (ID: knS2jhS94zFyAqVB)
   - Trigger: POST a `/webhook/ebook-miami`
   - Node 1: Webhook (recibe name+email)
   - Node 2: HTTP Request a MailerLite API
     - POST: `https://connect.mailerlite.com/api/subscribers`
     - Body: `{ email, fields: {name}, groups: ["189275226894238748"], status: "active" }`
   - Node 3: Responder 200 OK
   - **Status: Publicado pero INACTIVO (trial expirado)**

2. **[Webhook] Pago MercadoPago → enviar Calendly** (ID: MJZnW8iQ08P5xsOo)
   - Recibe IPN de MercadoPago
   - Verifica pago, agrega a MailerLite, envía email
   - **Status: Publicado pero INACTIVO (trial expirado)**

### MailerLite Configuration
- **Grupo: "Ebook Miami"** (ID: 189275226894238748)
  - Trigger: cuando suscriptor entra al grupo
  
- **Automation: "Bienvenida Ebook Miami"** (ACTIVA)
  - Email 1 (inmediato): "Tu guía de Miami ya está lista"
    - **Link pendiente actualizar:** `https://fernanda-miami.vercel.app/guia-miami.pdf`
    - Asunto: "Tu guía de Miami ya está lista 📚"
  - Email 2 (día 2): "La noche antes de irnos" (historia personal)
  - Email 3 (día 5): "Lo que nadie te cuenta sobre los primeros meses"
  - Email 4 (día 9): CTA directo oferta USD 57
  - Condición salida: Si tag "Cliente-1:1" → exit automation

- **Grupo: "Cliente 1:1"** (ID: 189275261357786611)
  - Para suscriptores que compraron reunión

- **Grupo: "Pago MP"** (ID: 189288396553717189)
  - Para webhooks de MercadoPago

---

## DECISIONES TOMADAS

1. **Tipografía final**: Outfit (sans-serif moderno, ultra legible) reemplazando Playfair Display
2. **Emojis eliminados**: Reemplazados completamente con SVG icons lineales
3. **Imágenes reales**: 
   - Landing: Fer en Times Square (8d411f6b)
   - Historia: Fer en casa Miami (57b29b97)
   - Reunión: Familia en Miami (9f86d178)
   - Cierre: Paisaje Miami (f62ba8b6)
4. **Navbar unificada**: Mismo diseño en index.html, gracias.html, reunion.html (Inicio + Hablemos)
5. **PDF generación**: Chrome headless en local, no Vercel deployment
6. **Secuencia emails**: 4 emails (acortada de 6 originales) en 9 días

---

## PROBLEMAS RESUELTOS

### ✅ RESUELTOS
1. **Tipografía fea** → Cambio a Outfit (moderno, legible)
2. **Emojis en todo** → Reemplazados con SVG icons
3. **Whitespace excesivo** → Comprimido al máximo
4. **Imagen última página PDF** → Cambiada a f62ba8b6
5. **Nav desincronizado** → Botones Inicio/Hablemos en todas las páginas
6. **Email no llega** → Causa identificada: trial n8n expirado
7. **Workflow Calendly** → Creado (ymhDvcNhL68D2g50) y archivado por no ser necesario

### ⚠️ BLOQUEADOS
- **n8n trial expirado**: Sin pago, los HTTP requests NO se ejecutan
  - Webhook recibe datos pero no puede agregar a MailerLite
  - Usuario ve "Enviado" pero email nunca llega

---

## ESTADO ACTUAL DEL PROYECTO

### ✅ COMPLETADO Y FUNCIONANDO
- Landing page (index.html) — diseño final, navbar OK
- Página gracias (gracias.html) — activa, navbar OK
- Página reunión (reunion.html) — activa, navbar OK, 2 CTAs (Calendly + MercadoPago)
- PDF ebook — generado, 6 páginas, premium, con QR y link clickeable
- Calendly integración — funcionando (PayPal/tarjeta integrado en Calendly)
- MailerLite automation — creada, 4 emails configurados, activa
- Vercel deployment — todas las páginas online

### ❌ BLOQUEADO (Trial n8n expirado)
- Webhook captura lead → MailerLite NO funciona
- Consecuencia: formulario se envía pero email NO llega
- **Necesita: Pagar n8n $20/mes O migrar a Make.com gratis**

### ⚠️ PENDIENTE MINOR
- Email 1 en MailerLite: Link PDF aún dice `[LINK_EBOOK_AQUÍ]` (debe actualizarse a `https://fernanda-miami.vercel.app/guia-miami.pdf`)

---

## FLUJO ACTUAL (Esperado cuando n8n esté activo)

```
1. Usuario en celular → https://fernanda-miami.vercel.app
2. Llena formulario (nombre + email)
3. Click "Descargar guía gratis"
4. → Webhook n8n recibe POST
5. → n8n agrega email al grupo "Ebook Miami" en MailerLite
6. → MailerLite dispara Email 1 automático
7. → Usuario recibe email con link al PDF
8. → User abre `/reunion` desde PDF o Calendly
9. → Paga USD 57 (Calendly PayPal o MercadoPago)
10. → Reserva reunión 1:1 con Fer
```

---

## PRÓXIMOS PASOS PENDIENTES

### CRÍTICO (Debe hacerse ahora)
1. **Elegir solución para n8n expirado:**
   - **Opción A:** Pagar n8n Cloud $20/mes (TODO funciona al instante)
   - **Opción B:** Migrar a Make.com gratis (requiere crear cuenta + recrear workflows, 15 min)

2. **Una vez n8n funcionando:**
   - Actualizar Email 1 en MailerLite con link PDF correcto
   - Probar flujo completo desde celular (formulario → email → descarga PDF → link reunion)
   - Verificar que Email 2, 3, 4 se envían con delays correctos

### OPCIONAL (Mejoras futuras)
- Configurar webhook MercadoPago en n8n (para auto-taggear clientes pagos)
- Configurar webhook Calendly en n8n (para email confirmación post-reunión)
- Agregar tracking de conversión (Google Analytics, Pixel Facebook)
- Crear landing page versión PDF (para compartir en redes)
- A/B test de copy/imágenes en landing

---

## LINKS IMPORTANTES

- **Landing:** https://fernanda-miami.vercel.app
- **Gracias:** https://fernanda-miami.vercel.app/gracias
- **Reunión:** https://fernanda-miami.vercel.app/reunion
- **PDF:** https://fernanda-miami.vercel.app/guia-miami.pdf
- **Calendly:** https://calendly.com/ferxmiami/new-meeting
- **MercadoPago:** https://mpago.la/1uxfiyH
- **n8n Cloud:** https://nicocremaschi.app.n8n.cloud (TRIAL EXPIRADO)
- **MailerLite:** dashboard.mailerlite.com

---

## CREDENCIALES Y TOKENS

- **MailerLite API Key:** Guardado en n8n workflows (Bearer token en HTTP headers)
- **MercadoPago Access Token:** eyJ0eXAi... (guardado en n8n)
- **Calendly Username:** ferxmiami
- **Vercel Project:** fernanda-miami (connected to git)

---

## NOTAS TÉCNICAS

- Todos los SVG icons generados inline en HTML (sin dependencias externas)
- QR code dinámico via https://api.qrserver.com
- PDF generado con Chrome headless (`--headless=new --print-to-pdf`)
- Fonts: Google Fonts (Outfit + Inter, sin serifs decorativos)
- Colors: Palette de 6 colores (rojo #B8512F, ámbar #C8882A, verde, cream, dark, white)
- Responsive: Media queries para mobile (max-width: 960px)

---

## RESUMEN EJECUTIVO PARA PRÓXIMA SESIÓN

**El sistema está listo al 95%. El ÚNICO bloqueo es que n8n Cloud expiró su trial gratis.**

Decisión pendiente (usuario debe elegir hoy):
- **Pagar $20 n8n**: Todo funciona mañana
- **Usar Make.com**: Gratis forever, 15 min setup

Una vez resuelto, solo falta:
1. Activar webhook (n8n o Make)
2. Actualizar link PDF en Email 1 MailerLite
3. Probar flujo completo desde celular
4. Empezar a vender reuniones

**Ganancias potenciales:** 1-2 reuniones (USD 57 c/u) cubren costo n8n $20.
