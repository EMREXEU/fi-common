angular.module('selectedCourses', [])
    .service('selectedCoursesService', function () {
        var selectedCourseIds = [];


        var addId = function (id) {
            if (selectedCourseIds.indexOf(id) < 0)
                selectedCourseIds.push(id);
        };

        var removeId = function (id) {
            var index = selectedCourseIds.indexOf(id);
            if (index >= 0)
                selectedCourseIds.splice(index, 1);
        };

        var reports = null;

        return {selectedCourseIds: selectedCourseIds,
                addId : addId,
                removeId :removeId,
                reports : reports
    }});
