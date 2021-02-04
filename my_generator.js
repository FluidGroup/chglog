console.log("Loaded my cutsom generator")

module.exports = () => {

    return {

        visit(pullRequest) {
            console.log(pullRequest)
        },

        visitLabel(label, pullRequest) {

        },

        visitAuthor(author, pullRequest) {

        },

        render() {

            return "Empty"
        }
    }
}