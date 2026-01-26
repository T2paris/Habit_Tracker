<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-left">
        <span class="footer-brand">Habi<span class="footer-accent">tree</span></span>
        <span class="footer-sep">•</span>
        <span class="footer-copy">© {{ year }} Habitree</span>
      </div>

      <div class="footer-right">
        <span class="footer-note">Constrói hábitos. Ganha consistência.</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>

<style scoped>
/* ✅ full width, sempre coerente */
.footer {
  width: 100%;
  background: #255a50; /* verde escuro coerente com o resto */
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.footer-inner {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 14px 16px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.footer-left,
.footer-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.footer-brand {
  color: #eaf5f2;
  font-weight: 950;
}

.footer-accent {
  color: #46b04a;
}

.footer-sep {
  color: rgba(234, 245, 242, 0.55);
  font-weight: 900;
}

.footer-copy {
  color: rgba(234, 245, 242, 0.88);
  font-weight: 850;
  font-size: 12px;
}

.footer-note {
  color: rgba(234, 245, 242, 0.78);
  font-weight: 850;
  font-size: 12px;
}
</style>
