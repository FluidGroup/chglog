console.log("Loaded my cutsom generator")

module.exports = () => {

    const state = {
        titles: []
    }

    return {

        visit(pullRequest) {
            state.titles.push(pullRequest.title)
        },

        visitLabel(label, pullRequest) {

        },

        visitAuthor(author, pullRequest) {

        },

        render() {
            
            return JSON.stringify(state, null, 2)
        }
    }
}