export default {
  methods: {
    navigateTo(name, params) {
      this.$navigator.navigateTo(name, params);
    },
    back() {
      this.$navigator.back();
    },
  },
};
