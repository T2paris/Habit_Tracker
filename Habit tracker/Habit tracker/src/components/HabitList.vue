<!-- src/components/HabitList.vue -->
<template>
  <div>
    <div v-if="habits.length === 0">Nenhum hábito. Cria um!</div>
    <ul>
      <li v-for="h in habits" :key="h.id">
        <strong>{{ h.title }}</strong> — {{ h.description }}
        <div>
          <button @click="$emit('edit', h)">Editar</button>
          <button @click="$emit('delete', h.id)">Apagar</button>
          <button @click="toggle(h.id)">
            {{ isCompletedToday(h) ? 'Desmarcar' : 'Completar (hoje)' }}
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['habits'],
  methods: {
    toggle(id) {
      this.$emit('toggle', id)
    },
    isCompletedToday(h) {
      const today = new Date().toISOString().slice(0,10)
      return h.completedDates && h.completedDates.includes(today)
    }
  }
}
</script>
