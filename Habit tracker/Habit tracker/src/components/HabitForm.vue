<!-- src/components/HabitForm.vue -->
<template>
  <form @submit.prevent="onSubmit">
    <div>
      <label>Título</label>
      <input v-model="title" required />
    </div>
    <div>
      <label>Descrição</label>
      <input v-model="description" />
    </div>
    <div>
      <label>Frequência</label>
      <select v-model="frequency">
        <option>Daily</option>
        <option>Weekly</option>
      </select>
    </div>
    <button type="submit">{{ editId ? 'Atualizar' : 'Criar' }}</button>
  </form>
</template>

<script>
export default {
  props: {
    edit: Object
  },
  data() {
    return {
      editId: this.edit?.id ?? null,
      title: this.edit?.title ?? '',
      description: this.edit?.description ?? '',
      frequency: this.edit?.frequency ?? 'Daily'
    }
  },
  methods: {
    onSubmit() {
      const payload = {
        id: this.editId ?? Date.now().toString(),
        title: this.title,
        description: this.description,
        frequency: this.frequency
      }
      this.$emit('submit', payload)
      this.title = ''
      this.description = ''
      this.frequency = 'Daily'
      this.editId = null
    }
  }
}
</script>

<style>
/* simples estilos */
form div { margin-bottom: 8px; }
</style>
