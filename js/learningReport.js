angular.module('learningReport', [])
    .directive('learningReportDirective', function (selectedCoursesService, helperService) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                report: '=',
                typeFilter: '=',
                levelFilter: '=',
                onlyViewing: '='
            },
            templateUrl: 'fi-common/partials/learningReport.html',
            controller: function ($scope) {

                $scope.selectAll = true;

                $scope.selectAllClicked = function(){
                    angular.forEach($scope.flattenedLearningOpportunities, function(opportunity){
                        opportunity.selected = $scope.selectAll;
                        $scope.checkBoxChanged(opportunity);
                    });
                }

                if (!angular.isArray($scope.report.learningOpportunitySpecification))
                    $scope.report.learningOpportunitySpecification = [{learningOpportunitySpecification: $scope.report.learningOpportunitySpecification}];

                $scope.getRightLanguage = helperService.getRightLanguage;

                $scope.selectedTypes = function (report) {
                    if ($scope.onlyViewing)
                        return true;
                    else
                        return $scope.typeFilter[report.type];
                };

                $scope.selectedLevel = function (report) {
                    if ($scope.onlyViewing || $scope.levelFilter == "Any")
                        return true;
                    else
                        return $scope.levelFilter == report.level;
                };


                function recursiveOpportunityFlattening(learningOpportunityArray, partOf) {
                    angular.forEach(learningOpportunityArray, function (opportunityWrapper) {

                        if (opportunityWrapper) {

                            // in some cases learningopportunityspecification is an array. some cases not..
                            if (opportunityWrapper.learningOpportunitySpecification)
                                var opportunity = opportunityWrapper.learningOpportunitySpecification;
                            else
                                var opportunity = opportunityWrapper;


                            // Add Elmo identifier
                            if (angular.isArray(opportunity.identifier))
                                angular.forEach(opportunity.identifier, function (identifier) {
                                    if (identifier.type == "elmo")
                                        opportunity.elmoIdentifier = identifier.content;
                                    if (identifier.type == "local")
                                        opportunity.localIdentifier = identifier.content;
                                })
                            else if (opportunity.identifier)
                                opportunity.elmoIdentifier = opportunity.identifier.content;

                            // Find parents Elmo identifier
                            if (partOf && partOf.elmoIdentifier)
                                opportunity.partOf = partOf.elmoIdentifier
                            else
                                opportunity.partOf = '-';

                            flatArray.push(opportunity);

                            // Add properties for table
                            if (opportunity.selected === undefined) {
                                opportunity.selected = true;
                                selectedCoursesService.addId(opportunity.elmoIdentifier); // all are selected at the beginning
                            }
                            // Recursion
                            if (opportunity.hasPart)
                                recursiveOpportunityFlattening(opportunity.hasPart, opportunity)
                        }
                    });
                    return flatArray;
                };

                var flatArray = [];
                flatArray = recursiveOpportunityFlattening($scope.report.learningOpportunitySpecification);
                $scope.flattenedLearningOpportunities = flatArray;

                $scope.issuerName = helperService.getRightLanguage($scope.report.issuer.title);

                var selectParent = function (child) {
                    if (child.partOf != '-')
                        angular.forEach($scope.flattenedLearningOpportunities, function (possibleParent) {
                            if (possibleParent.elmoIdentifier == child.partOf) {
                                possibleParent.selected = true;
                                $scope.checkBoxChanged(possibleParent);
                            }
                        });
                };

                var deselectChilds = function (parent) {
                    angular.forEach($scope.flattenedLearningOpportunities, function (possibleChild) {
                        if (parent.elmoIdentifier == possibleChild.partOf) {
                            possibleChild.selected = false;
                            $scope.checkBoxChanged(possibleChild);
                        }
                    })
                }


                $scope.checkBoxChanged = function (opportunity) {
                    if (opportunity.selected) {
                        selectedCoursesService.addId(opportunity.elmoIdentifier)
                        selectParent(opportunity);

                    }
                    else {
                        selectedCoursesService.removeId(opportunity.elmoIdentifier);
                        deselectChilds(opportunity);
                    }
                }
            }
        }
    });
